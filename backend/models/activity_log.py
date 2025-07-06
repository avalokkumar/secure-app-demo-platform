"""
ActivityLog model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class ActivityLog(db.Model):
    """
    ActivityLog model for tracking user activities.
    """
    __tablename__ = 'activity_logs'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='SET NULL'))
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.String(100))
    details = db.Column(db.JSON)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='activity_logs')

    def to_dict(self):
        """
        Convert activity log object to dictionary for JSON serialization.
        
        Returns:
            dict: Activity log data as dictionary
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        """
        String representation of the ActivityLog model.
        
        Returns:
            str: ActivityLog representation
        """
        return f"<ActivityLog user_id={self.user_id} action={self.action}>"
