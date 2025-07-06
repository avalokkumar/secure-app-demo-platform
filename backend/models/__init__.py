"""
Models package initialization.
"""
# Import all models to ensure they're registered with SQLAlchemy
from models.db import db
from models.user import User
from models.module import Module
from models.lesson import Lesson
from models.exercise import Exercise
from models.code_snippet import CodeSnippet
from models.user_progress import UserProgress
from models.user_exercise_submission import UserExerciseSubmission
from models.user_quiz_answer import UserQuizAnswer
from models.user_session import UserSession
from models.activity_log import ActivityLog
