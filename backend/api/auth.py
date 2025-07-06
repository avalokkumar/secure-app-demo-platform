"""
Authentication API endpoints for the SADP application.
"""
from datetime import datetime, timedelta
import uuid
import secrets

from flask import request, current_app
from flask_restful import Resource
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)

from models.db import db
from models.user import User
from models.user_session import UserSession
from models.activity_log import ActivityLog
from utils.request_utils import get_request_ip, get_request_user_agent
from utils.email_utils import send_password_reset_email


class AuthLoginResource(Resource):
    """Resource for user login."""
    
    def post(self):
        """
        Handle user login requests.
        
        Returns:
            tuple: Response data and status code
        """
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ('username', 'password')):
            return {'message': 'Missing required fields'}, 400
        
        # Find user by username
        user = User.query.filter_by(username=data['username']).first()
        
        # Verify user exists and password is correct
        if not user or not user.verify_password(data['password']):
            return {'message': 'Invalid credentials'}, 401
        
        # Verify user is active
        if not user.is_active:
            return {'message': 'Account is inactive'}, 403
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Update last login timestamp
        user.last_login = datetime.utcnow()
        
        # Create user session
        expires_at = datetime.utcnow() + current_app.config.get('JWT_REFRESH_TOKEN_EXPIRES', timedelta(days=30))
        session = UserSession(
            user_id=user.id,
            token=refresh_token,
            ip_address=get_request_ip(),
            user_agent=get_request_user_agent(),
            expires_at=expires_at
        )
        
        # Log activity
        activity = ActivityLog(
            user_id=user.id,
            action='login',
            entity_type='user',
            entity_id=user.id,
            ip_address=get_request_ip(),
            details={'method': 'password'}
        )
        
        # Commit to database
        db.session.add(session)
        db.session.add(activity)
        db.session.commit()
        
        return {
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 200


class AuthRegisterResource(Resource):
    """Resource for user registration."""
    
    def post(self):
        """
        Handle user registration requests.
        
        Returns:
            tuple: Response data and status code
        """
        data = request.get_json()
        
        # Validate required fields
        required_fields = ('username', 'email', 'password', 'first_name', 'last_name')
        if not data or not all(k in data for k in required_fields):
            return {'message': 'Missing required fields'}, 400
        
        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            return {'message': 'Username already in use'}, 409
        
        if User.query.filter_by(email=data['email']).first():
            return {'message': 'Email already in use'}, 409
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role='user'
        )
        user.password = data['password']  # This will hash the password
        
        # Log activity
        activity = ActivityLog(
            user_id=user.id,
            action='register',
            entity_type='user',
            entity_id=user.id,
            ip_address=get_request_ip(),
            details={'method': 'self-registration'}
        )
        
        # Commit to database
        db.session.add(user)
        db.session.add(activity)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Create user session
        expires_at = datetime.utcnow() + current_app.config.get('JWT_REFRESH_TOKEN_EXPIRES', timedelta(days=30))
        session = UserSession(
            user_id=user.id,
            token=refresh_token,
            ip_address=get_request_ip(),
            user_agent=get_request_user_agent(),
            expires_at=expires_at
        )
        
        db.session.add(session)
        db.session.commit()
        
        return {
            'message': 'Registration successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 201


class AuthRefreshResource(Resource):
    """Resource for refreshing access tokens."""
    
    @jwt_required(refresh=True)
    def post(self):
        """
        Handle token refresh requests.
        
        Returns:
            tuple: Response data and status code
        """
        # Get user ID from refresh token
        user_id = get_jwt_identity()
        
        # Generate new access token
        access_token = create_access_token(identity=user_id)
        
        return {
            'message': 'Token refresh successful',
            'access_token': access_token
        }, 200


class AuthLogoutResource(Resource):
    """Resource for user logout."""
    
    @jwt_required()
    def post(self):
        """
        Handle user logout requests.
        
        Returns:
            tuple: Response data and status code
        """
        # Get user identity (user_id) from JWT
        user_id = get_jwt_identity()
        
        # Get token jti (JWT ID) from the JWT
        token_jti = get_jwt()['jti']
        
        try:
            # Find session by user_id and token
            user_session = UserSession.query.filter_by(user_id=user_id).filter(
                UserSession.token.contains(token_jti)
            ).first()
            
            if user_session:
                # Mark session as expired
                user_session.expires_at = datetime.utcnow()
                db.session.commit()
                
            # Log the logout activity
            activity_log = ActivityLog(
                user_id=user_id,
                action='logout',
                entity_type='user',
                entity_id=user_id,
                ip_address=get_request_ip(),
                details={'method': 'api'}
            )
            db.session.add(activity_log)
            db.session.commit()
                
            return {'message': 'Successfully logged out'}, 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Logout error: {str(e)}")
            return {'message': 'An error occurred during logout'}, 500


class AuthRequestPasswordResetResource(Resource):
    """Resource for requesting a password reset."""
    
    def post(self):
        """Handle password reset request.
        
        Returns:
            tuple: Response data and status code
        """
        data = request.get_json()
        
        # Validate required fields
        if not data or 'email' not in data:
            return {'message': 'Email is required'}, 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        # Always return success even if user not found for security reasons
        if not user or not user.is_active:
            return {'message': 'If your email exists in our system, you will receive password reset instructions'}, 200
        
        try:
            # Generate a secure token
            token = secrets.token_urlsafe(64)
            
            # Store token in database with expiration time (30 minutes)
            user.reset_token = token
            user.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=30)
            db.session.commit()
            
            # Send password reset email
            send_password_reset_email(user, token)
            
            # Log the activity
            activity_log = ActivityLog(
                user_id=user.id,
                action='password_reset_request',
                entity_type='user',
                entity_id=user.id,
                ip_address=get_request_ip(),
                details={'method': 'api', 'email': user.email}
            )
            db.session.add(activity_log)
            db.session.commit()
            
            return {'message': 'If your email exists in our system, you will receive password reset instructions'}, 200
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Password reset request error: {str(e)}")
            return {'message': 'An error occurred processing your request'}, 500


class AuthConfirmPasswordResetResource(Resource):
    """Resource for confirming a password reset."""
    
    def post(self):
        """Handle password reset confirmation.
        
        Returns:
            tuple: Response data and status code
        """
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ('token', 'new_password')):
            return {'message': 'Token and new password are required'}, 400
        
        # Find user by reset token
        user = User.query.filter_by(reset_token=data['token']).first()
        
        # Check if user exists and token is valid
        if not user or not user.reset_token_expires_at or user.reset_token_expires_at < datetime.utcnow():
            return {'message': 'Invalid or expired token'}, 400
        
        try:
            # Check password meets requirements
            if len(data['new_password']) < 8:
                return {'message': 'Password must be at least 8 characters long'}, 400
            
            # Update password and clear reset token
            user.set_password(data['new_password'])
            user.reset_token = None
            user.reset_token_expires_at = None
            db.session.commit()
            
            # Log the activity
            activity_log = ActivityLog(
                user_id=user.id,
                action='password_reset_complete',
                entity_type='user',
                entity_id=user.id,
                ip_address=get_request_ip(),
                details={'method': 'api'}
            )
            db.session.add(activity_log)
            db.session.commit()
            
            return {'message': 'Password successfully reset'}, 200
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Password reset confirmation error: {str(e)}")
            return {'message': 'An error occurred resetting your password'}, 500
