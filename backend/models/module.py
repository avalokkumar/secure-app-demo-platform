"""
Module model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class Module(db.Model):
    """
    Module model for storing vulnerability modules information.
    """
    __tablename__ = 'modules'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    difficulty = db.Column(db.String(20), nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lessons = db.relationship('Lesson', back_populates='module', lazy='dynamic')

    def to_dict(self):
        """
        Convert module object to dictionary for JSON serialization.
        
        Returns:
            dict: Module data as dictionary
        """
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'difficulty': self.difficulty,
            'order_index': self.order_index,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'lesson_count': self.lessons.filter_by(is_active=True).count()
        }

    def __repr__(self):
        """
        String representation of the Module model.
        
        Returns:
            str: Module representation
        """
        return f"<Module {self.name}>"
