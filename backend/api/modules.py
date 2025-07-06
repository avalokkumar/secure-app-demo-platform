"""
Module API endpoints for the SADP application.
"""
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.db import db
from models.user import User
from models.module import Module
from models.activity_log import ActivityLog
from utils.request_utils import get_request_ip, get_pagination_params, format_pagination_response


class ModuleResource(Resource):
    """Resource for individual module operations."""
    
    @jwt_required()
    def get(self, module_id):
        """
        Get module details.
        
        Args:
            module_id: Module ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get module from database
        module = Module.query.get(module_id)
        
        # Check if module exists
        if not module:
            return {'message': 'Module not found'}, 404
        
        # Check if module is active
        if not module.is_active:
            # Get current user
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            # Only allow admin or instructors to view inactive modules
            if not current_user or (not current_user.is_admin() and not current_user.is_instructor()):
                return {'message': 'Module not found'}, 404
        
        # Log activity
        activity = ActivityLog(
            user_id=get_jwt_identity(),
            action='view_module',
            entity_type='module',
            entity_id=module_id,
            ip_address=get_request_ip(),
            details={}
        )
        db.session.add(activity)
        db.session.commit()
        
        # Return module details
        return {'module': module.to_dict()}, 200
    
    @jwt_required()
    def put(self, module_id):
        """
        Update module details.
        
        Args:
            module_id: Module ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = User.query.get(current_user_id)
        
        # Check if user is admin or instructor
        if not current_user or (not current_user.is_admin() and not current_user.is_instructor()):
            return {'message': 'Access denied'}, 403
        
        # Get module from database
        module = Module.query.get(module_id)
        
        # Check if module exists
        if not module:
            return {'message': 'Module not found'}, 404
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Update module details
        if 'name' in data:
            module.name = data['name']
        if 'description' in data:
            module.description = data['description']
        if 'difficulty' in data:
            module.difficulty = data['difficulty']
        if 'order_index' in data:
            module.order_index = data['order_index']
        if 'is_active' in data:
            module.is_active = data['is_active']
        
        # Update slug if name changed (and slug not provided)
        if 'name' in data and 'slug' not in data:
            # Generate slug from name
            slug = data['name'].lower().replace(' ', '-')
            
            # Check if slug is already in use by another module
            existing_module = Module.query.filter(Module.slug == slug, Module.id != module_id).first()
            if existing_module:
                # Append module ID to make slug unique
                slug += f'-{module_id[:8]}'
            
            module.slug = slug
        elif 'slug' in data:
            # Check if slug is already in use by another module
            existing_module = Module.query.filter(Module.slug == data['slug'], Module.id != module_id).first()
            if existing_module:
                return {'message': 'Slug already in use'}, 409
            
            module.slug = data['slug']
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='update_module',
            entity_type='module',
            entity_id=module_id,
            ip_address=get_request_ip(),
            details={'updated_fields': list(data.keys())}
        )
        
        # Commit to database
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Module updated successfully', 'module': module.to_dict()}, 200
    
    @jwt_required()
    def delete(self, module_id):
        """
        Delete module.
        
        Args:
            module_id: Module ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not current_user or not current_user.is_admin():
            return {'message': 'Access denied'}, 403
        
        # Get module to delete
        module = Module.query.get(module_id)
        
        # Check if module exists
        if not module:
            return {'message': 'Module not found'}, 404
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='delete_module',
            entity_type='module',
            entity_id=module_id,
            ip_address=get_request_ip(),
            details={'name': module.name}
        )
        
        # Delete module (cascade will delete related lessons, exercises, etc.)
        db.session.delete(module)
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Module deleted successfully'}, 200


class ModuleListResource(Resource):
    """Resource for operations on multiple modules."""
    
    @jwt_required()
    def get(self):
        """
        Get list of modules.
        
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Get pagination parameters
        page, per_page = get_pagination_params()
        
        # Get filters
        difficulty = request.args.get('difficulty')
        is_active = request.args.get('is_active')
        
        # Build query
        query = Module.query
        
        if difficulty:
            query = query.filter(Module.difficulty == difficulty)
        
        # Filter by active status
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            query = query.filter(Module.is_active == is_active_bool)
        elif not current_user.is_admin() and not current_user.is_instructor():
            # Regular users can only see active modules
            query = query.filter(Module.is_active == True)
        
        # Execute query with pagination
        pagination = query.order_by(Module.order_index).paginate(page=page, per_page=per_page)
        
        # Format response
        response = format_pagination_response(pagination)
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='list_modules',
            entity_type='module',
            entity_id=None,
            ip_address=get_request_ip(),
            details={'filters': {'difficulty': difficulty, 'is_active': is_active}}
        )
        db.session.add(activity)
        db.session.commit()
        
        return response, 200
    
    @jwt_required()
    def post(self):
        """
        Create new module.
        
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = User.query.get(current_user_id)
        
        # Check if user is admin or instructor
        if not current_user or (not current_user.is_admin() and not current_user.is_instructor()):
            return {'message': 'Access denied'}, 403
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Validate required fields
        required_fields = ('name', 'difficulty', 'order_index')
        if not all(field in data for field in required_fields):
            return {'message': 'Missing required fields'}, 400
        
        # Generate slug if not provided
        if 'slug' not in data:
            # Generate slug from name
            slug = data['name'].lower().replace(' ', '-')
            
            # Check if slug is already in use
            existing_module = Module.query.filter_by(slug=slug).first()
            if existing_module:
                # Append timestamp to make slug unique
                import time
                slug += f'-{int(time.time())}'
        else:
            slug = data['slug']
            
            # Check if slug is already in use
            existing_module = Module.query.filter_by(slug=slug).first()
            if existing_module:
                return {'message': 'Slug already in use'}, 409
        
        # Create new module
        module = Module(
            name=data['name'],
            slug=slug,
            description=data.get('description', ''),
            difficulty=data['difficulty'],
            order_index=data['order_index'],
            is_active=data.get('is_active', True)
        )
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='create_module',
            entity_type='module',
            entity_id=module.id,
            ip_address=get_request_ip(),
            details={'name': module.name}
        )
        
        # Commit to database
        db.session.add(module)
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Module created successfully', 'module': module.to_dict()}, 201
