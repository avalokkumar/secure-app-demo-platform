"""
Test fixtures and configuration for the SADP backend tests.
"""
import os
import tempfile
import pytest
from datetime import datetime, timedelta

from flask_jwt_extended import create_access_token

from app import create_app
from models.db import db
from models.user import User
from models.module import Module
from models.lesson import Lesson
from models.exercise import Exercise
from models.code_snippet import CodeSnippet


@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    # Create a temporary file to use as the database
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app('testing')
    app.config.update({
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'TESTING': True,
        'JWT_SECRET_KEY': 'test_secret_key'
    })
    
    # Create the database and tables
    with app.app_context():
        db.create_all()
        _seed_test_data()
    
    yield app
    
    # Clean up
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def auth_headers(app):
    """JWT authentication headers for API requests."""
    with app.app_context():
        # Get admin user
        user = User.query.filter_by(username='testadmin').first()
        access_token = create_access_token(identity=user.id)
        
        return {'Authorization': f'Bearer {access_token}'}


@pytest.fixture
def user_auth_headers(app):
    """JWT authentication headers for a regular user."""
    with app.app_context():
        # Get regular user
        user = User.query.filter_by(username='testuser').first()
        access_token = create_access_token(identity=user.id)
        
        return {'Authorization': f'Bearer {access_token}'}


def _seed_test_data():
    """Seed the database with test data."""
    # Create test users
    admin = User(
        username='testadmin',
        email='admin@test.com',
        first_name='Test',
        last_name='Admin',
        role='admin',
        is_active=True
    )
    admin.password = 'adminpass'
    
    user = User(
        username='testuser',
        email='user@test.com',
        first_name='Test',
        last_name='User',
        role='user',
        is_active=True
    )
    user.password = 'userpass'
    
    # Create test module
    module = Module(
        name='SQL Injection Test Module',
        slug='sql-injection-test',
        description='A module for testing SQL injection vulnerabilities',
        difficulty='beginner',
        order_index=1,
        is_active=True
    )
    
    # Create test lessons
    theory_lesson = Lesson(
        module=module,
        title='SQL Injection Introduction',
        slug='sql-injection-intro',
        description='An introduction to SQL injection attacks',
        content_type='theory',
        content='{"blocks":[{"text":"Introduction to SQL injection attacks"}]}',
        order_index=1,
        is_active=True
    )
    
    exercise_lesson = Lesson(
        module=module,
        title='SQL Injection Exercise',
        slug='sql-injection-exercise',
        description='Practice identifying SQL injection vulnerabilities',
        content_type='exercise',
        content='{"blocks":[{"text":"SQL injection exercise instructions"}]}',
        order_index=2,
        is_active=True
    )
    
    # Create test exercise
    exercise = Exercise(
        lesson=exercise_lesson,
        title='Find the SQL Injection',
        description='Identify the SQL injection vulnerability in the code',
        instructions='Look for vulnerable code in the login function',
        sandbox_config={
            'timeout': 5,
            'memory_limit': 64,
            'language': 'python'
        },
        success_criteria='Exploit the vulnerability to bypass authentication'
    )
    
    # Create test code snippet
    code_snippet = CodeSnippet(
        lesson=theory_lesson,
        title='Vulnerable Login Function',
        description='A login function vulnerable to SQL injection',
        vulnerable_code="def login(username, password):\n    query = \"SELECT * FROM users WHERE username = '\" + username + \"' AND password = '\" + password + \"'\"\n    result = db.execute(query)\n    return result.fetchone() is not None",
        secure_code="def login(username, password):\n    query = \"SELECT * FROM users WHERE username = ? AND password = ?\"\n    result = db.execute(query, (username, password))\n    return result.fetchone() is not None",
        language='python',
        explanation='The vulnerable code directly concatenates user input into the SQL query, allowing attackers to manipulate the query structure. The secure version uses parameterized queries to prevent SQL injection.'
    )
    
    # Add all objects to session
    db.session.add_all([admin, user, module, theory_lesson, exercise_lesson, exercise, code_snippet])
    db.session.commit()
