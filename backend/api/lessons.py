"""
Lesson API endpoints for the SADP application.
"""
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.db import db
from models.user import User
from models.lesson import Lesson
from models.module import Module
from models.activity_log import ActivityLog
from utils.request_utils import get_request_ip, get_pagination_params, format_pagination_response


class LessonResource(Resource):
    """Resource for individual lesson operations."""
    
    @jwt_required()
    def get(self, lesson_id):
        """
        Get lesson details.
        
        Args:
            lesson_id: Lesson ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get lesson from database
        lesson = Lesson.query.get(lesson_id)
        
        # Check if lesson exists
        if not lesson:
            return {'message': 'Lesson not found'}, 404
        
        # Check if module and lesson are active
        if not lesson.is_active or not lesson.module.is_active:
            # Get current user
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            # Only allow admin or instructors to view inactive lessons
            if not current_user or (not current_user.is_admin() and not current_user.is_instructor()):
                return {'message': 'Lesson not found'}, 404
        
        # Log activity
        activity = ActivityLog(
            user_id=get_jwt_identity(),
            action='view_lesson',
            entity_type='lesson',
            entity_id=lesson_id,
            ip_address=get_request_ip(),
            details={'module_id': lesson.module_id}
        )
        db.session.add(activity)
        db.session.commit()
        
        # Return lesson details
        return {'lesson': lesson.to_dict()}, 200
    
    @jwt_required()
    def put(self, lesson_id):
        """
        Update lesson details.
        
        Args:
            lesson_id: Lesson ID
            
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
        
        # Get lesson from database
        lesson = Lesson.query.get(lesson_id)
        
        # Check if lesson exists
        if not lesson:
            return {'message': 'Lesson not found'}, 404
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Update lesson details
        if 'title' in data:
            lesson.title = data['title']
        if 'description' in data:
            lesson.description = data['description']
        if 'content_type' in data:
            lesson.content_type = data['content_type']
        if 'content' in data:
            lesson.content = data['content']
        if 'order_index' in data:
            lesson.order_index = data['order_index']
        if 'is_active' in data:
            lesson.is_active = data['is_active']
        if 'module_id' in data:
            # Check if module exists
            module = Module.query.get(data['module_id'])
            if not module:
                return {'message': 'Module not found'}, 404
            lesson.module_id = data['module_id']
        
        # Update slug if title changed (and slug not provided)
        if 'title' in data and 'slug' not in data:
            # Generate slug from title
            slug = data['title'].lower().replace(' ', '-')
            
            # Check if slug is already in use by another lesson in the same module
            existing_lesson = Lesson.query.filter(
                Lesson.slug == slug,
                Lesson.module_id == lesson.module_id,
                Lesson.id != lesson_id
            ).first()
            if existing_lesson:
                # Append lesson ID to make slug unique
                slug += f'-{lesson_id[:8]}'
            
            lesson.slug = slug
        elif 'slug' in data:
            # Check if slug is already in use by another lesson in the same module
            existing_lesson = Lesson.query.filter(
                Lesson.slug == data['slug'],
                Lesson.module_id == lesson.module_id,
                Lesson.id != lesson_id
            ).first()
            if existing_lesson:
                return {'message': 'Slug already in use in this module'}, 409
            
            lesson.slug = data['slug']
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='update_lesson',
            entity_type='lesson',
            entity_id=lesson_id,
            ip_address=get_request_ip(),
            details={'updated_fields': list(data.keys()), 'module_id': lesson.module_id}
        )
        
        # Commit to database
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Lesson updated successfully', 'lesson': lesson.to_dict()}, 200
    
    @jwt_required()
    def delete(self, lesson_id):
        """
        Delete lesson.
        
        Args:
            lesson_id: Lesson ID
            
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
        
        # Get lesson to delete
        lesson = Lesson.query.get(lesson_id)
        
        # Check if lesson exists
        if not lesson:
            return {'message': 'Lesson not found'}, 404
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='delete_lesson',
            entity_type='lesson',
            entity_id=lesson_id,
            ip_address=get_request_ip(),
            details={'title': lesson.title, 'module_id': lesson.module_id}
        )
        
        # Delete lesson (cascade will delete related exercises, code snippets, etc.)
        db.session.delete(lesson)
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Lesson deleted successfully'}, 200


class LessonListResource(Resource):
    """Resource for operations on multiple lessons."""
    
    @jwt_required()
    def get(self, module_id):
        """
        Get list of lessons for a module.
        
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
        
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check if module is active
        if not module.is_active and not current_user.is_admin() and not current_user.is_instructor():
            return {'message': 'Module not found'}, 404
        
        # Get pagination parameters
        page, per_page = get_pagination_params()
        
        # Get filters
        content_type = request.args.get('content_type')
        is_active = request.args.get('is_active')
        
        # Build query
        query = Lesson.query.filter(Lesson.module_id == module_id)
        
        if content_type:
            query = query.filter(Lesson.content_type == content_type)
        
        # Filter by active status
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            query = query.filter(Lesson.is_active == is_active_bool)
        elif not current_user.is_admin() and not current_user.is_instructor():
            # Regular users can only see active lessons
            query = query.filter(Lesson.is_active == True)
        
        # Execute query with pagination
        pagination = query.order_by(Lesson.order_index).paginate(page=page, per_page=per_page)
        
        # Format response
        response = format_pagination_response(pagination)
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='list_lessons',
            entity_type='module',
            entity_id=module_id,
            ip_address=get_request_ip(),
            details={'filters': {'content_type': content_type, 'is_active': is_active}}
        )
        db.session.add(activity)
        db.session.commit()
        
        return response, 200
    
    @jwt_required()
    def post(self, module_id):
        """
        Create new lesson in a module.
        
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
        
        # Validate required fields
        required_fields = ('title', 'content_type', 'content', 'order_index')
        if not all(field in data for field in required_fields):
            return {'message': 'Missing required fields'}, 400
        
        # Generate slug if not provided
        if 'slug' not in data:
            # Generate slug from title
            slug = data['title'].lower().replace(' ', '-')
            
            # Check if slug is already in use in this module
            existing_lesson = Lesson.query.filter_by(module_id=module_id, slug=slug).first()
            if existing_lesson:
                # Append timestamp to make slug unique
                import time
                slug += f'-{int(time.time())}'
        else:
            slug = data['slug']
            
            # Check if slug is already in use in this module
            existing_lesson = Lesson.query.filter_by(module_id=module_id, slug=slug).first()
            if existing_lesson:
                return {'message': 'Slug already in use in this module'}, 409
        
        # Create new lesson
        lesson = Lesson(
            module_id=module_id,
            title=data['title'],
            slug=slug,
            description=data.get('description', ''),
            content_type=data['content_type'],
            content=data['content'],
            order_index=data['order_index'],
            is_active=data.get('is_active', True)
        )
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='create_lesson',
            entity_type='lesson',
            entity_id=lesson.id,
            ip_address=get_request_ip(),
            details={'title': lesson.title, 'module_id': module_id}
        )
        
        # Commit to database
        db.session.add(lesson)
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Lesson created successfully', 'lesson': lesson.to_dict()}, 201
