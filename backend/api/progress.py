"""
User progress tracking API endpoints for the SADP application.
"""
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.db import db
from models.user import User
from models.user_progress import UserProgress
from models.module import Module
from models.activity_log import ActivityLog
from utils.request_utils import get_request_ip, get_pagination_params, format_pagination_response


class UserProgressResource(Resource):
    """Resource for tracking user progress."""
    
    @jwt_required()
    def get(self, user_id):
        """
        Get progress for a specific user.
        
        Args:
            user_id: User ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get current user
        current_user = User.query.get(current_user_id)
        
        # Check authorization (users can only view their own progress unless they're admins/instructors)
        if user_id != current_user_id and not current_user.is_admin() and not current_user.is_instructor():
            return {'message': 'Access denied'}, 403
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        # Get module filter if provided
        module_id = request.args.get('module_id')
        
        # Get progress summaries
        if module_id:
            # Check if module exists
            module = Module.query.get(module_id)
            if not module:
                return {'message': 'Module not found'}, 404
            
            # Get all lessons for the module
            lessons = module.lessons.all()
            lesson_ids = [lesson.id for lesson in lessons]
            
            # Get progress for all lessons in the module
            progress_items = UserProgress.query.filter(
                UserProgress.user_id == user_id,
                UserProgress.lesson_id.in_(lesson_ids)
            ).all()
            
            # Format response
            progress = {
                'module': module.to_dict(),
                'total_lessons': len(lessons),
                'completed_lessons': sum(1 for p in progress_items if p.status == 'completed'),
                'progress_details': [p.to_dict() for p in progress_items]
            }
            
            response = {'progress': progress}
        else:
            # Get all modules
            modules = Module.query.filter_by(is_active=True).all()
            
            # Get progress summary for each module
            progress = []
            for module in modules:
                lessons = module.lessons.filter_by(is_active=True).all()
                lesson_ids = [lesson.id for lesson in lessons]
                
                # Get progress for all lessons in this module
                progress_items = UserProgress.query.filter(
                    UserProgress.user_id == user_id,
                    UserProgress.lesson_id.in_(lesson_ids)
                ).all()
                
                # Calculate completion percentage
                total_lessons = len(lessons)
                completed_lessons = sum(1 for p in progress_items if p.status == 'completed')
                completion_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
                
                # Add to progress list
                progress.append({
                    'module': module.to_dict(),
                    'total_lessons': total_lessons,
                    'completed_lessons': completed_lessons,
                    'completion_percentage': completion_percentage
                })
            
            response = {'progress': progress}
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='view_progress',
            entity_type='user',
            entity_id=user_id,
            ip_address=get_request_ip(),
            details={'module_id': module_id}
        )
        db.session.add(activity)
        db.session.commit()
        
        return response, 200


class LessonProgressResource(Resource):
    """Resource for tracking user progress on specific lessons."""
    
    @jwt_required()
    def post(self, lesson_id):
        """
        Update user progress for a lesson.
        
        Args:
            lesson_id: Lesson ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Check if lesson exists
        from models.lesson import Lesson
        lesson = Lesson.query.get(lesson_id)
        if not lesson:
            return {'message': 'Lesson not found'}, 404
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Validate status
        status = data.get('status')
        if status and status not in ('not_started', 'in_progress', 'completed', 'failed'):
            return {'message': 'Invalid status'}, 400
        
        # Get existing progress or create new
        progress = UserProgress.query.filter_by(
            user_id=current_user_id,
            lesson_id=lesson_id
        ).first()
        
        if progress:
            # Update existing progress
            if status:
                progress.status = status
            
            if status == 'completed' and not progress.completed_at:
                from datetime import datetime
                progress.completed_at = datetime.utcnow()
            
            if 'score' in data:
                progress.score = data['score']
            
            progress.attempts += 1
            from datetime import datetime
            progress.last_attempt_at = datetime.utcnow()
        else:
            # Create new progress
            from datetime import datetime
            progress = UserProgress(
                user_id=current_user_id,
                lesson_id=lesson_id,
                status=status or 'in_progress',
                score=data.get('score'),
                attempts=1,
                last_attempt_at=datetime.utcnow(),
                completed_at=datetime.utcnow() if status == 'completed' else None
            )
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='update_progress',
            entity_type='lesson',
            entity_id=lesson_id,
            ip_address=get_request_ip(),
            details={'status': status, 'score': data.get('score')}
        )
        
        # Commit to database
        db.session.add(progress)
        db.session.add(activity)
        db.session.commit()
        
        return {
            'message': 'Progress updated successfully',
            'progress': progress.to_dict()
        }, 200
