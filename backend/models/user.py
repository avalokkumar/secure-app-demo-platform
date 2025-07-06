"""
User model for the SADP application.
"""
import uuid
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from models.db import db


class User(db.Model):
    """
    User model for storing user authentication and profile data.
    """
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.String(20), nullable=False, default='user')
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expires_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    progress = db.relationship('UserProgress', back_populates='user', lazy='dynamic')
    exercise_submissions = db.relationship('UserExerciseSubmission', back_populates='user', lazy='dynamic')
    quiz_answers = db.relationship('UserQuizAnswer', back_populates='user', lazy='dynamic')
    sessions = db.relationship('UserSession', back_populates='user', lazy='dynamic')
    activity_logs = db.relationship('ActivityLog', back_populates='user', lazy='dynamic')

    @property
    def password(self):
        """
        Password getter method raises an exception to prevent password access.
        """
        raise AttributeError('Password is not a readable attribute')

    @password.setter
    def password(self, password):
        """
        Password setter method that generates password hash.
        
        Args:
            password: Plain text password
        """
        # Use explicit method parameter to avoid compatibility issues
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def verify_password(self, password):
        """
        Verify the provided password against the stored hash.
        
        Args:
            password: Plain text password to verify
            
        Returns:
            bool: True if password is valid, False otherwise
        """
        # Handle potential errors during password verification
        try:
            return check_password_hash(self.password_hash, password)
        except TypeError:
            # Handle legacy or incorrectly formatted password hashes
            print(f"TypeError verifying password for user", flush=True)
            return False

    def is_admin(self):
        """
        Check if user has admin role.
        
        Returns:
            bool: True if user is an admin, False otherwise
        """
        return self.role == 'admin'

    def is_instructor(self):
        """
        Check if user has instructor role.
        
        Returns:
            bool: True if user is an instructor, False otherwise
        """
        return self.role == 'instructor'

    def to_dict(self):
        """
        Convert user object to dictionary for JSON serialization.
        Excludes sensitive information like password hash.
        
        Returns:
            dict: User data as dictionary
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    def __repr__(self):
        """
        String representation of the User model.
        
        Returns:
            str: User representation
        """
        return f"<User {self.username}>"
