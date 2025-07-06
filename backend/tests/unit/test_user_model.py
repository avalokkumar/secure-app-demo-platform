"""
Unit tests for the User model.
"""
import pytest
from models.user import User


def test_user_creation():
    """Test creating a new User instance."""
    user = User(
        username='testuser',
        email='test@example.com',
        first_name='Test',
        last_name='User',
        role='user',
        is_active=True
    )
    user.password = 'password123'
    
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'
    assert user.first_name == 'Test'
    assert user.last_name == 'User'
    assert user.role == 'user'
    assert user.is_active is True
    assert user.password_hash is not None
    assert user.password_hash != 'password123'  # Password should be hashed


def test_password_hashing():
    """Test password hashing functionality."""
    user = User(username='testuser')
    
    # Set password
    user.password = 'password123'
    
    # Password should be hashed
    assert user.password_hash != 'password123'
    
    # Verify password
    assert user.verify_password('password123') is True
    assert user.verify_password('wrongpassword') is False


def test_password_getter():
    """Test that password property raises an exception when accessed."""
    user = User(username='testuser')
    
    # Set password
    user.password = 'password123'
    
    # Accessing password property should raise an exception
    with pytest.raises(AttributeError):
        password = user.password


def test_user_roles():
    """Test user role checking methods."""
    admin = User(username='admin', role='admin')
    instructor = User(username='instructor', role='instructor')
    user = User(username='user', role='user')
    
    assert admin.is_admin() is True
    assert admin.is_instructor() is False
    
    assert instructor.is_admin() is False
    assert instructor.is_instructor() is True
    
    assert user.is_admin() is False
    assert user.is_instructor() is False


def test_to_dict():
    """Test the to_dict method."""
    user = User(
        username='testuser',
        email='test@example.com',
        first_name='Test',
        last_name='User',
        role='user',
        is_active=True
    )
    
    user_dict = user.to_dict()
    
    assert user_dict['username'] == 'testuser'
    assert user_dict['email'] == 'test@example.com'
    assert user_dict['first_name'] == 'Test'
    assert user_dict['last_name'] == 'User'
    assert user_dict['role'] == 'user'
    assert user_dict['is_active'] is True
    assert 'password_hash' not in user_dict  # Sensitive data should not be included
