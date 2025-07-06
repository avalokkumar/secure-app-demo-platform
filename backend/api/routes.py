"""
API routes and blueprints registration for the SADP application.
"""
from flask import Blueprint
from flask_restful import Api

from api.auth import (
    AuthLoginResource, AuthRegisterResource, AuthRefreshResource, AuthLogoutResource,
    AuthRequestPasswordResetResource, AuthConfirmPasswordResetResource
)
from api.users import UserResource, UserListResource
from api.modules import ModuleResource, ModuleListResource
from api.lessons import LessonResource, LessonListResource
from api.exercises import ExerciseResource, ExerciseSubmissionResource
from api.progress import UserProgressResource, LessonProgressResource
from api.achievements import UserAchievementResource, AchievementGrantResource, ModuleAccessResource


def register_routes(app):
    """
    Register all API routes with the Flask application.
    
    Args:
        app: Flask application instance
    """
    # Get API prefix from config
    api_prefix = app.config.get('API_PREFIX', '/api')

    # Create Blueprint for API
    api_bp = Blueprint('api', __name__)
    api = Api(api_bp)

    # Authentication endpoints
    api.add_resource(AuthLoginResource, '/auth/login')
    api.add_resource(AuthRegisterResource, '/auth/register')
    api.add_resource(AuthRefreshResource, '/auth/refresh')
    api.add_resource(AuthLogoutResource, '/auth/logout')
    api.add_resource(AuthRequestPasswordResetResource, '/auth/reset-password')
    api.add_resource(AuthConfirmPasswordResetResource, '/auth/reset-password/confirm')

    # User endpoints
    api.add_resource(UserResource, '/users/<string:user_id>')
    api.add_resource(UserListResource, '/users')

    # Module endpoints
    api.add_resource(ModuleResource, '/modules/<string:module_id>')
    api.add_resource(ModuleListResource, '/modules')

    # Lesson endpoints
    api.add_resource(LessonResource, '/lessons/<string:lesson_id>')
    api.add_resource(LessonListResource, '/modules/<string:module_id>/lessons')

    # Exercise endpoints
    api.add_resource(ExerciseResource, '/exercises/<string:exercise_id>')
    api.add_resource(ExerciseSubmissionResource, '/exercises/<string:exercise_id>/submit')

    # Progress tracking
    api.add_resource(UserProgressResource, '/progress/user/<string:user_id>')
    api.add_resource(LessonProgressResource, '/progress/lesson/<string:lesson_id>')
    
    # Achievements and Module Access
    api.add_resource(UserAchievementResource, '/achievements/user/<string:user_id>')
    api.add_resource(AchievementGrantResource, '/achievements/grant')
    api.add_resource(ModuleAccessResource, '/module-access', '/module-access/user/<string:user_id>')

    # Register blueprint with app
    app.register_blueprint(api_bp, url_prefix=api_prefix)
