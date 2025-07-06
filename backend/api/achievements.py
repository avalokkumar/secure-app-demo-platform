"""
User achievements API endpoints for the SADP application.
"""
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from models.db import db
from models.user import User
from models.user_achievement import UserAchievement
from models.module import Module
from models.user_module_access import UserModuleAccess
from models.activity_log import ActivityLog
from utils.request_utils import get_request_ip


class UserAchievementResource(Resource):
    """Resource for user achievements."""
    
    @jwt_required()
    def get(self, user_id):
        """
        Get all achievements for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Check if current user is authorized to view these achievements
        # (either it's the user's own achievements or they're an admin/instructor)
        if user_id != current_user_id:
            user = User.query.get(current_user_id)
            if not user or (not user.is_admin() and not user.is_instructor()):
                return {'message': 'Access denied'}, 403
        
        # Get all achievements for the user
        achievements = UserAchievement.query.filter_by(user_id=user_id).all()
        
        # Format response
        return {
            'achievements': [achievement.to_dict() for achievement in achievements]
        }, 200


class AchievementGrantResource(Resource):
    """Resource for granting achievements."""
    
    @jwt_required()
    def post(self):
        """
        Grant an achievement to a user.
        
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        user_id = get_jwt_identity()
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
            
        achievement_type = data.get('achievement_type')
        entity_type = data.get('entity_type')
        entity_id = data.get('entity_id')
        
        if not achievement_type or not entity_type:
            return {'message': 'Missing required fields'}, 400
        
        # Check if achievement already exists
        existing = UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_type=achievement_type,
            entity_type=entity_type,
            entity_id=entity_id
        ).first()
        
        if existing:
            return {'message': 'Achievement already granted', 'achievement': existing.to_dict()}, 200
        
        # Create new achievement
        achievement = UserAchievement(
            user_id=user_id,
            achievement_type=achievement_type,
            entity_type=entity_type,
            entity_id=entity_id,
            granted_at=datetime.utcnow()
        )
        
        # Log activity
        activity = ActivityLog(
            user_id=user_id,
            action='achievement_granted',
            entity_type='achievement',
            entity_id=None,  # Will be set after achievement is created
            ip_address=get_request_ip(),
            details={
                'achievement_type': achievement_type,
                'entity_type': entity_type,
                'entity_id': entity_id
            }
        )
        
        # Add to database
        db.session.add(achievement)
        db.session.flush()  # Get ID without committing
        
        # Update activity with achievement ID
        activity.entity_id = achievement.id
        db.session.add(activity)
        
        # Check if this achievement unlocks any modules
        # For example, completing all lessons in a module might unlock the next module
        if achievement_type == 'module_completed':
            # Get the next module in sequence
            completed_module = Module.query.get(entity_id)
            if completed_module:
                next_module = Module.query.filter(
                    Module.order_index == completed_module.order_index + 1
                ).first()
                
                if next_module:
                    # Check if user already has access
                    existing_access = UserModuleAccess.query.filter_by(
                        user_id=user_id,
                        module_id=next_module.id
                    ).first()
                    
                    if not existing_access:
                        # Grant access to next module
                        module_access = UserModuleAccess(
                            user_id=user_id,
                            module_id=next_module.id,
                            granted_at=datetime.utcnow()
                        )
                        db.session.add(module_access)
                        
                        # Log module unlock activity
                        unlock_activity = ActivityLog(
                            user_id=user_id,
                            action='module_unlocked',
                            entity_type='module',
                            entity_id=next_module.id,
                            ip_address=get_request_ip(),
                            details={
                                'trigger_achievement_id': achievement.id
                            }
                        )
                        db.session.add(unlock_activity)
        
        # Commit all changes
        db.session.commit()
        
        return {
            'message': 'Achievement granted successfully',
            'achievement': achievement.to_dict()
        }, 201


class ModuleAccessResource(Resource):
    """Resource for managing module access."""
    
    @jwt_required()
    def get(self, user_id=None):
        """
        Get module access for a user.
        
        Args:
            user_id: User ID (optional, defaults to current user)
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # If no user_id provided, use current user
        if not user_id:
            user_id = current_user_id
        
        # Check authorization
        if user_id != current_user_id:
            user = User.query.get(current_user_id)
            if not user or (not user.is_admin() and not user.is_instructor()):
                return {'message': 'Access denied'}, 403
        
        # Get all module access records for the user
        access_records = UserModuleAccess.query.filter_by(user_id=user_id).all()
        
        # Get modules the user has access to
        accessible_modules = []
        for record in access_records:
            module = Module.query.get(record.module_id)
            if module and module.is_active:
                module_dict = module.to_dict()
                module_dict['access_granted_at'] = record.granted_at.isoformat() if record.granted_at else None
                accessible_modules.append(module_dict)
        
        # Always include active modules with order_index 0 (introductory modules)
        intro_modules = Module.query.filter_by(order_index=0, is_active=True).all()
        for module in intro_modules:
            # Check if already in the list
            if not any(m['id'] == module.id for m in accessible_modules):
                module_dict = module.to_dict()
                module_dict['access_granted_at'] = None  # No specific grant time for intro modules
                accessible_modules.append(module_dict)
        
        return {
            'modules': accessible_modules
        }, 200
    
    @jwt_required()
    def post(self):
        """
        Grant access to a module for a user.
        
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Check if user is admin or instructor
        user = User.query.get(current_user_id)
        if not user or (not user.is_admin() and not user.is_instructor()):
            return {'message': 'Access denied'}, 403
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
            
        user_id = data.get('user_id')
        module_id = data.get('module_id')
        
        if not user_id or not module_id:
            return {'message': 'Missing required fields'}, 400
        
        # Check if user exists
        target_user = User.query.get(user_id)
        if not target_user:
            return {'message': 'User not found'}, 404
        
        # Check if module exists
        module = Module.query.get(module_id)
        if not module:
            return {'message': 'Module not found'}, 404
        
        # Check if access already exists
        existing_access = UserModuleAccess.query.filter_by(
            user_id=user_id,
            module_id=module_id
        ).first()
        
        if existing_access:
            return {'message': 'User already has access to this module'}, 200
        
        # Grant access
        module_access = UserModuleAccess(
            user_id=user_id,
            module_id=module_id,
            granted_at=datetime.utcnow()
        )
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='module_access_granted',
            entity_type='module',
            entity_id=module_id,
            ip_address=get_request_ip(),
            details={
                'target_user_id': user_id
            }
        )
        
        # Add to database
        db.session.add(module_access)
        db.session.add(activity)
        db.session.commit()
        
        return {
            'message': 'Module access granted successfully'
        }, 201
