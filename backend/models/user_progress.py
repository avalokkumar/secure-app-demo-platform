"""
UserProgress model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class UserProgress(db.Model):
    """
    UserProgress model for tracking user progress through lessons.
    """
    __tablename__ = 'user_progress'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.String(36), db.ForeignKey('lessons.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='not_started')
    completed_at = db.Column(db.DateTime)
    score = db.Column(db.Integer)
    attempts = db.Column(db.Integer, default=0)
    last_attempt_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='progress')
    lesson = db.relationship('Lesson', back_populates='user_progress')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'lesson_id', name='uix_user_lesson'),
    )

    def to_dict(self):
        """
        Convert user progress object to dictionary for JSON serialization.
        
        Returns:
            dict: User progress data as dictionary
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'lesson_id': self.lesson_id,
            'status': self.status,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'score': self.score,
            'attempts': self.attempts,
            'last_attempt_at': self.last_attempt_at.isoformat() if self.last_attempt_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        """
        String representation of the UserProgress model.
        
        Returns:
            str: UserProgress representation
        """
        return f"<UserProgress user_id={self.user_id} lesson_id={self.lesson_id} status={self.status}>"
