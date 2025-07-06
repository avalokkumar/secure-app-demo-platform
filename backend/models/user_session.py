"""
UserSession model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class UserSession(db.Model):
    """
    UserSession model for tracking active user sessions.
    """
    __tablename__ = 'user_sessions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='sessions')

    @property
    def is_expired(self):
        """
        Check if the session is expired.
        
        Returns:
            bool: True if the session is expired, False otherwise
        """
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        """
        Convert user session object to dictionary for JSON serialization.
        
        Returns:
            dict: User session data as dictionary
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_expired': self.is_expired
        }

    def __repr__(self):
        """
        String representation of the UserSession model.
        
        Returns:
            str: UserSession representation
        """
        return f"<UserSession user_id={self.user_id} expires_at={self.expires_at}>"
