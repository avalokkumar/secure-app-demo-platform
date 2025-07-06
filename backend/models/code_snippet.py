"""
CodeSnippet model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class CodeSnippet(db.Model):
    """
    CodeSnippet model for storing vulnerable and secure code examples.
    """
    __tablename__ = 'code_snippets'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lesson_id = db.Column(db.String(36), db.ForeignKey('lessons.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    vulnerable_code = db.Column(db.Text, nullable=False)
    secure_code = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(50), nullable=False)
    explanation = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lesson = db.relationship('Lesson', back_populates='code_snippets')

    def to_dict(self):
        """
        Convert code snippet object to dictionary for JSON serialization.
        
        Returns:
            dict: Code snippet data as dictionary
        """
        return {
            'id': self.id,
            'lesson_id': self.lesson_id,
            'title': self.title,
            'description': self.description,
            'vulnerable_code': self.vulnerable_code,
            'secure_code': self.secure_code,
            'language': self.language,
            'explanation': self.explanation,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        """
        String representation of the CodeSnippet model.
        
        Returns:
            str: CodeSnippet representation
        """
        return f"<CodeSnippet {self.title}>"
