"""
UserQuizAnswer model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class UserQuizAnswer(db.Model):
    """
    UserQuizAnswer model for storing user responses to quiz questions.
    """
    __tablename__ = 'user_quiz_answers'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.String(36), db.ForeignKey('lessons.id'), nullable=False)
    question_id = db.Column(db.String(100), nullable=False)
    selected_option = db.Column(db.String(100), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='quiz_answers')
    lesson = db.relationship('Lesson', back_populates='quiz_answers')

    def to_dict(self):
        """
        Convert user quiz answer object to dictionary for JSON serialization.
        
        Returns:
            dict: User quiz answer data as dictionary
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'lesson_id': self.lesson_id,
            'question_id': self.question_id,
            'selected_option': self.selected_option,
            'is_correct': self.is_correct,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        """
        String representation of the UserQuizAnswer model.
        
        Returns:
            str: UserQuizAnswer representation
        """
        return f"<UserQuizAnswer user_id={self.user_id} question_id={self.question_id} is_correct={self.is_correct}>"
