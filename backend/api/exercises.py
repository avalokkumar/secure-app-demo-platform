"""
Exercise API endpoints for the SADP application.
"""
from datetime import datetime
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.db import db
from models.user import User
from models.exercise import Exercise
from models.user_exercise_submission import UserExerciseSubmission
from models.activity_log import ActivityLog
from services.sandbox import execute_in_sandbox
from utils.request_utils import get_request_ip, get_pagination_params, format_pagination_response


class ExerciseResource(Resource):
    """Resource for individual exercise operations."""
    
    @jwt_required()
    def get(self, exercise_id):
        """
        Get exercise details.
        
        Args:
            exercise_id: Exercise ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get exercise from database
        exercise = Exercise.query.get(exercise_id)
        
        # Check if exercise exists
        if not exercise:
            return {'message': 'Exercise not found'}, 404
        
        # Check if lesson and module are active
        if not exercise.lesson.is_active or not exercise.lesson.module.is_active:
            # Get current user
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            # Only allow admin or instructors to view exercises from inactive lessons/modules
            if not current_user or (not current_user.is_admin() and not current_user.is_instructor()):
                return {'message': 'Exercise not found'}, 404
        
        # Get user submissions
        current_user_id = get_jwt_identity()
        submissions = UserExerciseSubmission.query.filter_by(
            user_id=current_user_id,
            exercise_id=exercise_id
        ).order_by(UserExerciseSubmission.created_at.desc()).all()
        
        # Format submissions
        formatted_submissions = [submission.to_dict() for submission in submissions]
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='view_exercise',
            entity_type='exercise',
            entity_id=exercise_id,
            ip_address=get_request_ip(),
            details={'lesson_id': exercise.lesson_id}
        )
        db.session.add(activity)
        db.session.commit()
        
        # Return exercise details with user submissions
        return {
            'exercise': exercise.to_dict(),
            'submissions': formatted_submissions
        }, 200
    
    @jwt_required()
    def put(self, exercise_id):
        """
        Update exercise details.
        
        Args:
            exercise_id: Exercise ID
            
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
        
        # Get exercise from database
        exercise = Exercise.query.get(exercise_id)
        
        # Check if exercise exists
        if not exercise:
            return {'message': 'Exercise not found'}, 404
        
        # Get data from request
        data = request.get_json()
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Update exercise details
        if 'title' in data:
            exercise.title = data['title']
        if 'description' in data:
            exercise.description = data['description']
        if 'instructions' in data:
            exercise.instructions = data['instructions']
        if 'sandbox_config' in data:
            exercise.sandbox_config = data['sandbox_config']
        if 'success_criteria' in data:
            exercise.success_criteria = data['success_criteria']
        if 'hints' in data:
            exercise.hints = data['hints']
        if 'lesson_id' in data:
            # Check if lesson exists
            from models.lesson import Lesson
            lesson = Lesson.query.get(data['lesson_id'])
            if not lesson:
                return {'message': 'Lesson not found'}, 404
            exercise.lesson_id = data['lesson_id']
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='update_exercise',
            entity_type='exercise',
            entity_id=exercise_id,
            ip_address=get_request_ip(),
            details={'updated_fields': list(data.keys()), 'lesson_id': exercise.lesson_id}
        )
        
        # Commit to database
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Exercise updated successfully', 'exercise': exercise.to_dict()}, 200
    
    @jwt_required()
    def delete(self, exercise_id):
        """
        Delete exercise.
        
        Args:
            exercise_id: Exercise ID
            
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
        
        # Get exercise to delete
        exercise = Exercise.query.get(exercise_id)
        
        # Check if exercise exists
        if not exercise:
            return {'message': 'Exercise not found'}, 404
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='delete_exercise',
            entity_type='exercise',
            entity_id=exercise_id,
            ip_address=get_request_ip(),
            details={'title': exercise.title, 'lesson_id': exercise.lesson_id}
        )
        
        # Delete exercise (cascade will delete related submissions)
        db.session.delete(exercise)
        db.session.add(activity)
        db.session.commit()
        
        return {'message': 'Exercise deleted successfully'}, 200


class ExerciseSubmissionResource(Resource):
    """Resource for submitting solutions to exercises."""
    
    @jwt_required()
    def post(self, exercise_id):
        """
        Submit solution for an exercise.
        
        Args:
            exercise_id: Exercise ID
            
        Returns:
            tuple: Response data and status code
        """
        # Get current user ID from token
        current_user_id = get_jwt_identity()
        
        # Get exercise from database
        exercise = Exercise.query.get(exercise_id)
        
        # Check if exercise exists
        if not exercise:
            return {'message': 'Exercise not found'}, 404
        
        # Get data from request
        data = request.get_json()
        if not data or 'code' not in data:
            return {'message': 'No code provided'}, 400
        
        # Get submitted code
        submitted_code = data['code']
        
        # Execute code in sandbox
        try:
            result = execute_in_sandbox(submitted_code, exercise.sandbox_config)
            is_successful = result.get('success', False)
            feedback = result.get('feedback', '')
            execution_time = result.get('execution_time', 0)
        except Exception as e:
            # Log the exception
            import traceback
            error_traceback = traceback.format_exc()
            
            # Create submission with error
            submission = UserExerciseSubmission(
                user_id=current_user_id,
                exercise_id=exercise_id,
                submitted_code=submitted_code,
                is_successful=False,
                feedback=f"Error executing code: {str(e)}",
                execution_time=0
            )
            
            # Log activity with error details
            activity = ActivityLog(
                user_id=current_user_id,
                action='submit_exercise',
                entity_type='exercise',
                entity_id=exercise_id,
                ip_address=get_request_ip(),
                details={
                    'error': str(e),
                    'traceback': error_traceback
                }
            )
            
            db.session.add(submission)
            db.session.add(activity)
            db.session.commit()
            
            return {
                'message': 'Error executing code',
                'error': str(e),
                'submission': submission.to_dict()
            }, 500
        
        # Create submission record
        submission = UserExerciseSubmission(
            user_id=current_user_id,
            exercise_id=exercise_id,
            submitted_code=submitted_code,
            is_successful=is_successful,
            feedback=feedback,
            execution_time=execution_time
        )
        
        # Update user progress if successful
        if is_successful:
            from models.user_progress import UserProgress
            progress = UserProgress.query.filter_by(
                user_id=current_user_id,
                lesson_id=exercise.lesson_id
            ).first()
            
            if not progress:
                # Create new progress record
                progress = UserProgress(
                    user_id=current_user_id,
                    lesson_id=exercise.lesson_id,
                    status='in_progress',
                    attempts=1,
                    last_attempt_at=datetime.utcnow()
                )
            else:
                # Update existing progress record
                progress.attempts += 1
                progress.last_attempt_at = datetime.utcnow()
                
                # If this is an exercise lesson and it's successful, mark as completed
                if exercise.lesson.content_type == 'exercise':
                    progress.status = 'completed'
                    progress.completed_at = datetime.utcnow()
            
            db.session.add(progress)
        
        # Log activity
        activity = ActivityLog(
            user_id=current_user_id,
            action='submit_exercise',
            entity_type='exercise',
            entity_id=exercise_id,
            ip_address=get_request_ip(),
            details={
                'successful': is_successful,
                'execution_time': execution_time
            }
        )
        
        # Commit to database
        db.session.add(submission)
        db.session.add(activity)
        db.session.commit()
        
        return {
            'message': 'Submission successful' if is_successful else 'Submission failed',
            'submission': submission.to_dict()
        }, 201
