"""
Unit tests for authentication API endpoints.
"""
import json
import unittest
from datetime import datetime
from unittest import mock

from flask_jwt_extended import create_access_token

from app import create_app
from models.db import db
from models.user import User


class AuthAPITestCase(unittest.TestCase):
    """Test case for authentication API endpoints."""

    def setUp(self):
        """Set up test client and database."""
        # Create app with SQLite in-memory database for testing
        self.app = create_app('testing')
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Create test user
        user = User(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User',
            role='user'
        )
        user.password = 'testpassword'  # This will hash the password
        user.is_active = True
        db.session.add(user)
        db.session.commit()

    def tearDown(self):
        """Clean up after tests."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_login_success(self):
        """Test successful login."""
        data = {
            'username': 'testuser',
            'password': 'testpassword'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        # Check response data
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Login successful')
        self.assertIn('access_token', response_data)
        self.assertIn('refresh_token', response_data)
        self.assertIn('user', response_data)
        self.assertEqual(response_data['user']['username'], 'testuser')

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        
        # Check error message
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Invalid credentials')

    def test_login_missing_fields(self):
        """Test login with missing fields."""
        data = {
            'username': 'testuser'
            # Missing password
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Check error message
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Missing required fields')

    def test_register_success(self):
        """Test successful user registration."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newuserpassword',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        
        # Check response data
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'User registered successfully')
        self.assertIn('access_token', response_data)
        self.assertIn('refresh_token', response_data)
        self.assertIn('user', response_data)
        self.assertEqual(response_data['user']['username'], 'newuser')
        self.assertEqual(response_data['user']['email'], 'newuser@example.com')

        # Verify user was created in database
        user = User.query.filter_by(username='newuser').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'User')
        self.assertTrue(user.verify_password('newuserpassword'))

    def test_register_duplicate_username(self):
        """Test registration with existing username."""
        data = {
            'username': 'testuser',  # Already exists
            'email': 'different@example.com',
            'password': 'newpassword',
            'first_name': 'Another',
            'last_name': 'User'
        }
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 409)
        
        # Check error message
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Username already in use')

    def test_register_duplicate_email(self):
        """Test registration with existing email."""
        data = {
            'username': 'different',
            'email': 'test@example.com',  # Already exists
            'password': 'newpassword',
            'first_name': 'Another',
            'last_name': 'User'
        }
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 409)
        
        # Check error message
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Email already in use')

    def test_register_missing_fields(self):
        """Test registration with missing fields."""
        data = {
            'username': 'incomplete',
            'email': 'incomplete@example.com'
            # Missing other required fields
        }
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Check error message
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Missing required fields')

    def test_refresh_token(self):
        """Test refreshing access token with valid refresh token."""
        # Create test user and token
        user = User.query.filter_by(username='testuser').first()
        refresh_token = create_access_token(identity=user.id, fresh=False)
        
        # Mock jwt identity from token
        with mock.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request') as mock_jwt:
            mock_jwt.return_value = True
            with mock.patch('flask_jwt_extended.view_decorators.get_jwt_identity') as mock_identity:
                mock_identity.return_value = user.id
                
                response = self.client.post(
                    '/api/auth/refresh',
                    headers={'Authorization': f'Bearer {refresh_token}'}
                )
                
        self.assertEqual(response.status_code, 200)
        
        # Check response data
        response_data = json.loads(response.data)
        self.assertIn('access_token', response_data)


if __name__ == '__main__':
    unittest.main()
