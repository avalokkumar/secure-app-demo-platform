"""
Lesson model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class Lesson(db.Model):
    """
    Lesson model for storing lesson information within modules.
    """
    __tablename__ = 'lessons'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = db.Column(db.String(36), db.ForeignKey('modules.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    content_type = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    module = db.relationship('Module', back_populates='lessons')
    exercises = db.relationship('Exercise', back_populates='lesson', lazy='dynamic')
    code_snippets = db.relationship('CodeSnippet', back_populates='lesson', lazy='dynamic')
    user_progress = db.relationship('UserProgress', back_populates='lesson', lazy='dynamic')
    quiz_answers = db.relationship('UserQuizAnswer', back_populates='lesson', lazy='dynamic')

    __table_args__ = (
        db.UniqueConstraint('module_id', 'slug', name='uix_lesson_module_slug'),
    )

    def to_dict(self, include_content=True):
        """
        Convert lesson object to dictionary for JSON serialization.
        
        Args:
            include_content: Whether to include the full content or just metadata
            
        Returns:
            dict: Lesson data as dictionary
        """
        result = {
            'id': self.id,
            'module_id': self.module_id,
            'title': self.title,
            'slug': self.slug,
            'description': self.description,
            'content_type': self.content_type,
            'order_index': self.order_index,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_content:
            result['content'] = self.content
            
        return result

    def __repr__(self):
        """
        String representation of the Lesson model.
        
        Returns:
            str: Lesson representation
        """
        return f"<Lesson {self.title}>"
