"""
User API endpoints for the SADP application.
"""
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.db import db
from models.user import User
from models.activity_log import ActivityLog
from utils.request_utils import get_request_ip, get_pagination_params, format_pagination_response


class UserResource(Resource):
    """Resource for individual user operations."""
    
    @jwt_required()
    def get(self, user_id):
        """
        Get user details.
        
        Args:
            user_id: User ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get user from database
        user = User.query.get(user_id)
        
        # Check if user exists
        if not user:
            return {'message': 'User not found'}, 404
        
        # Check authorization (users can only view their own details unless they're admins)
        current_user = User.query.get(current_user_id)
        if user_id != current_user_id and not current_user.is_admin():
            return {'message': 'Access denied'}, 403
        
        # Return user details
        return {'user': user.to_dict()}, 200
    
    @jwt_required()
    def put(self, user_id):
        """
        Update user details.
        
        Args:
            user_id: User ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get user from database
        user = User.query.get(user_id)
        
        # Check if user exists
        if not user:
            return {'message': 'User not found'}, 404
        
        # Check authorization (users can only update their own details unless they're admins)
        current_user = User.query.get(current_user_id)
        if user_id != current_user_id and not current_user.is_admin():
            return {'message': 'Access denied'}, 403
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Update user details
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            # Check if email is already in use by another user
            existing_user = User.query.filter(User.email == data['email'], User.id != user_id).first()
            if existing_user:
                return {'message': 'Email already in use'}, 409
            user.email = data['email']
        
        # Admin-only updates
        if current_user.is_admin():
            if 'role' in data:
                user.role = data['role']
            if 'is_active' in data:
                user.is_active = data['is_active']
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='update_user',
            entity_type='user',
            entity_id=user_id,
            ip_address=get_request_ip(),
            details={'updated_fields': list(data.keys())}
        )
        
        # Commit to database
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'User updated successfully', 'user': user.to_dict()}, 200
    
    @jwt_required()
    def delete(self, user_id):
        """
        Delete user.
        
        Args:
            user_id: User ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not current_user.is_admin():
            return {'message': 'Access denied'}, 403
        
        # Get user to delete
        user = User.query.get(user_id)
        
        # Check if user exists
        if not user:
            return {'message': 'User not found'}, 404
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='delete_user',
            entity_type='user',
            entity_id=user_id,
            ip_address=get_request_ip(),
            details={}
        )
        
        # Delete user
        db.session.delete(user)
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'User deleted successfully'}, 200


class UserListResource(Resource):
    """Resource for operations on multiple users."""
    
    @jwt_required()
    def get(self):
        """
        Get list of users.
        
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not current_user.is_admin() and not current_user.is_instructor():
            return {'message': 'Access denied'}, 403
        
        # Get pagination parameters
        page, per_page = get_pagination_params()
        
        # Get filters
        role = request.args.get('role')
        is_active = request.args.get('is_active')
        
        # Build query
        query = User.query
        
        if role:
            query = query.filter(User.role == role)
        
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            query = query.filter(User.is_active == is_active_bool)
        
        # Execute query with pagination
        pagination = query.order_by(User.username).paginate(page=page, per_page=per_page)
        
        # Format response
        response = format_pagination_response(pagination)
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='list_users',
            entity_type='user',
            entity_id=None,
            ip_address=get_request_ip(),
            details={'filters': {'role': role, 'is_active': is_active}}
        )
        db.session.add(activity)
        db.session.commit()
        
        return response, 200
