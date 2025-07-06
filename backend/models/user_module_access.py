"""
UserModuleAccess model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class UserModuleAccess(db.Model):
    """
    UserModuleAccess model for tracking which modules a user has access to.
    """
    __tablename__ = 'user_module_access'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(db.String(36), db.ForeignKey('modules.id'), nullable=False)
    granted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('module_access', lazy='dynamic'))
    module = db.relationship('Module')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'module_id', name='uix_user_module_access'),
    )

    def to_dict(self):
        """
        Convert access object to dictionary for JSON serialization.
        
        Returns:
            dict: Access data as dictionary
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module_id': self.module_id,
            'granted_at': self.granted_at.isoformat() if self.granted_at else None
        }

    def __repr__(self):
        """
        String representation of the UserModuleAccess model.
        
        Returns:
            str: Model representation
        """
        return f"<UserModuleAccess User: {self.user_id}, Module: {self.module_id}>"
