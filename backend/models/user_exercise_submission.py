"""
UserExerciseSubmission model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class UserExerciseSubmission(db.Model):
    """
    UserExerciseSubmission model for storing user submissions for exercises.
    """
    __tablename__ = 'user_exercise_submissions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    exercise_id = db.Column(db.String(36), db.ForeignKey('exercises.id'), nullable=False)
    submitted_code = db.Column(db.Text, nullable=False)
    is_successful = db.Column(db.Boolean)
    feedback = db.Column(db.Text)
    execution_time = db.Column(db.Numeric)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='exercise_submissions')
    exercise = db.relationship('Exercise', back_populates='submissions')

    def to_dict(self):
        """
        Convert user exercise submission object to dictionary for JSON serialization.
        
        Returns:
            dict: User exercise submission data as dictionary
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_id': self.exercise_id,
            'submitted_code': self.submitted_code,
            'is_successful': self.is_successful,
            'feedback': self.feedback,
            'execution_time': float(self.execution_time) if self.execution_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        """
        String representation of the UserExerciseSubmission model.
        
        Returns:
            str: UserExerciseSubmission representation
        """
        return f"<UserExerciseSubmission user_id={self.user_id} exercise_id={self.exercise_id} successful={self.is_successful}>"
