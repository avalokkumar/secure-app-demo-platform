"""
UserAchievement model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class UserAchievement(db.Model):
    """
    UserAchievement model for tracking user achievements.
    """
    __tablename__ = 'user_achievements'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    achievement_type = db.Column(db.String(50), nullable=False)  # e.g., 'module_completed', 'lesson_completed'
    entity_type = db.Column(db.String(50), nullable=False)  # e.g., 'module', 'lesson'
    entity_id = db.Column(db.String(36))  # ID of the related entity (module, lesson, etc.)
    granted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('achievements', lazy='dynamic'))

    def to_dict(self):
        """
        Convert achievement object to dictionary for JSON serialization.
        
        Returns:
            dict: Achievement data as dictionary
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'achievement_type': self.achievement_type,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'granted_at': self.granted_at.isoformat() if self.granted_at else None
        }

    def __repr__(self):
        """
        String representation of the UserAchievement model.
        
        Returns:
            str: Model representation
        """
        return f"<UserAchievement {self.id} - User: {self.user_id}, Type: {self.achievement_type}>"
