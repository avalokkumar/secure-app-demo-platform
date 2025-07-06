"""
Exercise model for the SADP application.
"""
import uuid
from datetime import datetime

from models.db import db


class Exercise(db.Model):
    """
    Exercise model for storing interactive exercise information.
    """
    __tablename__ = 'exercises'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lesson_id = db.Column(db.String(36), db.ForeignKey('lessons.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    instructions = db.Column(db.Text, nullable=False)
    sandbox_config = db.Column(db.JSON)
    success_criteria = db.Column(db.Text)
    hints = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lesson = db.relationship('Lesson', back_populates='exercises')
    submissions = db.relationship('UserExerciseSubmission', back_populates='exercise', lazy='dynamic')

    def to_dict(self):
        """
        Convert exercise object to dictionary for JSON serialization.
        
        Returns:
            dict: Exercise data as dictionary
        """
        return {
            'id': self.id,
            'lesson_id': self.lesson_id,
            'title': self.title,
            'description': self.description,
            'instructions': self.instructions,
            'sandbox_config': self.sandbox_config,
            'success_criteria': self.success_criteria,
            'hints': self.hints,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        """
        String representation of the Exercise model.
        
        Returns:
            str: Exercise representation
        """
        return f"<Exercise {self.title}>"
