"""
Integration tests for the authentication API endpoints.
"""
import json


def test_login_success(client):
    """Test successful login."""
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'testuser',
            'password': 'userpass'
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify response contains required fields
    assert 'access_token' in data
    assert 'refresh_token' in data
    assert 'user' in data
    assert data['user']['username'] == 'testuser'


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'testuser',
            'password': 'wrongpassword'
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['message'] == 'Invalid credentials'


def test_login_missing_fields(client):
    """Test login with missing fields."""
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'testuser'
            # Missing password
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['message'] == 'Missing required fields'


def test_register_success(client):
    """Test successful registration."""
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newuserpass',
            'first_name': 'New',
            'last_name': 'User'
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 201
    data = json.loads(response.data)
    
    # Verify response contains required fields
    assert 'access_token' in data
    assert 'refresh_token' in data
    assert 'user' in data
    assert data['user']['username'] == 'newuser'
    assert data['user']['email'] == 'new@example.com'
    assert data['user']['first_name'] == 'New'
    assert data['user']['last_name'] == 'User'
    assert data['user']['role'] == 'user'  # Default role should be 'user'


def test_register_duplicate_username(client):
    """Test registration with duplicate username."""
    # First create a user
    client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'duplicateuser',
            'email': 'duplicate@example.com',
            'password': 'userpass',
            'first_name': 'Duplicate',
            'last_name': 'User'
        }),
        content_type='application/json'
    )
    
    # Try to register with the same username
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'duplicateuser',
            'email': 'different@example.com',
            'password': 'userpass',
            'first_name': 'Different',
            'last_name': 'User'
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 409
    data = json.loads(response.data)
    assert data['message'] == 'Username already in use'


def test_register_duplicate_email(client):
    """Test registration with duplicate email."""
    # First create a user
    client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'emailuser1',
            'email': 'duplicate@example.com',
            'password': 'userpass',
            'first_name': 'Email',
            'last_name': 'User1'
        }),
        content_type='application/json'
    )
    
    # Try to register with the same email
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'emailuser2',
            'email': 'duplicate@example.com',
            'password': 'userpass',
            'first_name': 'Email',
            'last_name': 'User2'
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 409
    data = json.loads(response.data)
    assert data['message'] == 'Email already in use'


def test_refresh_token(client, auth_headers):
    """Test refreshing access token."""
    # Login to get refresh token
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'testuser',
            'password': 'userpass'
        }),
        content_type='application/json'
    )
    
    refresh_token = json.loads(login_response.data)['refresh_token']
    
    # Use refresh token to get new access token
    response = client.post(
        '/api/auth/refresh',
        headers={'Authorization': f'Bearer {refresh_token}'}
    )
    
    # Check response
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify response contains new access token
    assert 'access_token' in data
