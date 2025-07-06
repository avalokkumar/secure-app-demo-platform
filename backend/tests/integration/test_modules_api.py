"""
Integration tests for the module API endpoints.
"""
import json
from flask import url_for


def test_get_modules_list(client, auth_headers):
    """Test getting list of modules."""
    response = client.get(
        '/api/modules',
        headers=auth_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify response contains modules
    assert 'items' in data
    assert len(data['items']) > 0
    assert 'pagination' in data


def test_get_modules_list_as_regular_user(client, user_auth_headers):
    """Test getting list of modules as a regular user (should only see active modules)."""
    response = client.get(
        '/api/modules',
        headers=user_auth_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify all returned modules are active
    for module in data['items']:
        assert module['is_active'] is True


def test_get_module_details(client, auth_headers):
    """Test getting details of a specific module."""
    # First get list of modules to get an ID
    response = client.get('/api/modules', headers=auth_headers)
    modules = json.loads(response.data)['items']
    module_id = modules[0]['id']
    
    # Get module details
    response = client.get(
        f'/api/modules/{module_id}',
        headers=auth_headers
    )
    
    # Check response
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify response contains module details
    assert 'module' in data
    assert data['module']['id'] == module_id
    assert 'name' in data['module']
    assert 'description' in data['module']
    assert 'difficulty' in data['module']


def test_create_module(client, auth_headers):
    """Test creating a new module."""
    response = client.post(
        '/api/modules',
        headers=auth_headers,
        data=json.dumps({
            'name': 'Test XSS Module',
            'slug': 'test-xss-module',
            'description': 'A module for testing XSS vulnerabilities',
            'difficulty': 'intermediate',
            'order_index': 2,
            'is_active': True
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 201
    data = json.loads(response.data)
    
    # Verify response contains new module
    assert 'module' in data
    assert data['module']['name'] == 'Test XSS Module'
    assert data['module']['slug'] == 'test-xss-module'
    assert data['module']['difficulty'] == 'intermediate'
    assert data['module']['order_index'] == 2


def test_create_module_missing_fields(client, auth_headers):
    """Test creating a new module with missing required fields."""
    response = client.post(
        '/api/modules',
        headers=auth_headers,
        data=json.dumps({
            'name': 'Incomplete Module',
            # Missing difficulty
            'order_index': 3
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['message'] == 'Missing required fields'


def test_create_module_duplicate_slug(client, auth_headers):
    """Test creating a new module with a duplicate slug."""
    # First create a module
    client.post(
        '/api/modules',
        headers=auth_headers,
        data=json.dumps({
            'name': 'First Module',
            'slug': 'duplicate-slug',
            'description': 'First module with this slug',
            'difficulty': 'beginner',
            'order_index': 1
        }),
        content_type='application/json'
    )
    
    # Try to create another module with the same slug
    response = client.post(
        '/api/modules',
        headers=auth_headers,
        data=json.dumps({
            'name': 'Second Module',
            'slug': 'duplicate-slug',
            'description': 'Second module with this slug',
            'difficulty': 'beginner',
            'order_index': 2
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 409
    data = json.loads(response.data)
    assert data['message'] == 'Slug already in use'


def test_update_module(client, auth_headers):
    """Test updating a module."""
    # First create a module
    create_response = client.post(
        '/api/modules',
        headers=auth_headers,
        data=json.dumps({
            'name': 'Update Test Module',
            'description': 'Original description',
            'difficulty': 'beginner',
            'order_index': 5
        }),
        content_type='application/json'
    )
    
    module_id = json.loads(create_response.data)['module']['id']
    
    # Update the module
    response = client.put(
        f'/api/modules/{module_id}',
        headers=auth_headers,
        data=json.dumps({
            'description': 'Updated description',
            'difficulty': 'advanced'
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify module was updated
    assert data['module']['description'] == 'Updated description'
    assert data['module']['difficulty'] == 'advanced'
    assert data['module']['name'] == 'Update Test Module'  # Unchanged field


def test_delete_module(client, auth_headers):
    """Test deleting a module."""
    # First create a module
    create_response = client.post(
        '/api/modules',
        headers=auth_headers,
        data=json.dumps({
            'name': 'Module to Delete',
            'description': 'This module will be deleted',
            'difficulty': 'beginner',
            'order_index': 10
        }),
        content_type='application/json'
    )
    
    module_id = json.loads(create_response.data)['module']['id']
    
    # Delete the module
    response = client.delete(
        f'/api/modules/{module_id}',
        headers=auth_headers
    )
    
    # Check response
    assert response.status_code == 200
    
    # Verify module was deleted
    response = client.get(
        f'/api/modules/{module_id}',
        headers=auth_headers
    )
    assert response.status_code == 404


def test_module_access_permissions(client, user_auth_headers):
    """Test that regular users cannot create/update/delete modules."""
    # Attempt to create a module
    response = client.post(
        '/api/modules',
        headers=user_auth_headers,
        data=json.dumps({
            'name': 'Unauthorized Module',
            'description': 'This should not be created',
            'difficulty': 'beginner',
            'order_index': 1
        }),
        content_type='application/json'
    )
    
    # Check response (should be forbidden)
    assert response.status_code == 403
