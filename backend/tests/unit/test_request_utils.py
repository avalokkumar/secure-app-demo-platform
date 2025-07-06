"""
Unit tests for request utility functions.
"""
from unittest.mock import Mock, patch
from flask import Request

from utils.request_utils import get_request_ip, get_request_user_agent, get_pagination_params, format_pagination_response


def test_get_request_ip_with_x_forwarded_for():
    """Test getting client IP with X-Forwarded-For header."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
        mock_request.remote_addr = '10.0.0.2'
        
        ip = get_request_ip()
        
        assert ip == '192.168.1.1'


def test_get_request_ip_without_x_forwarded_for():
    """Test getting client IP without X-Forwarded-For header."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.headers = {}
        mock_request.remote_addr = '10.0.0.2'
        
        ip = get_request_ip()
        
        assert ip == '10.0.0.2'


def test_get_request_user_agent():
    """Test getting user agent from request."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.headers = {'User-Agent': 'Test Browser/1.0'}
        
        user_agent = get_request_user_agent()
        
        assert user_agent == 'Test Browser/1.0'


def test_get_request_user_agent_missing():
    """Test getting user agent when it's not in the request."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.headers = {}
        
        user_agent = get_request_user_agent()
        
        assert user_agent == ''


def test_get_pagination_params_default():
    """Test getting default pagination parameters."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.args = {}
        
        page, per_page = get_pagination_params()
        
        assert page == 1
        assert per_page == 20


def test_get_pagination_params_custom():
    """Test getting custom pagination parameters."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.args = {'page': '2', 'per_page': '50'}
        
        page, per_page = get_pagination_params()
        
        assert page == 2
        assert per_page == 50


def test_get_pagination_params_invalid():
    """Test handling invalid pagination parameters."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.args = {'page': 'invalid', 'per_page': 'invalid'}
        
        page, per_page = get_pagination_params()
        
        assert page == 1
        assert per_page == 20


def test_get_pagination_params_max_per_page():
    """Test limiting the maximum per_page value."""
    with patch('utils.request_utils.request') as mock_request:
        mock_request.args = {'per_page': '200'}
        
        page, per_page = get_pagination_params()
        
        assert per_page == 100  # Maximum allowed value


def test_format_pagination_response():
    """Test formatting a pagination response."""
    # Create mock pagination object
    class MockPagination:
        def __init__(self):
            self.items = [Mock(to_dict=lambda: {'id': f'item{i}'}) for i in range(3)]
            self.page = 2
            self.per_page = 10
            self.pages = 5
            self.total = 47
    
    pagination = MockPagination()
    
    # Format response
    response = format_pagination_response(pagination)
    
    # Check response
    assert 'items' in response
    assert len(response['items']) == 3
    assert response['items'][0] == {'id': 'item0'}
    assert response['items'][1] == {'id': 'item1'}
    assert response['items'][2] == {'id': 'item2'}
    
    assert 'pagination' in response
    assert response['pagination']['page'] == 2
    assert response['pagination']['per_page'] == 10
    assert response['pagination']['total_pages'] == 5
    assert response['pagination']['total_items'] == 47


def test_format_pagination_response_with_schema():
    """Test formatting a pagination response with a schema."""
    # Create mock pagination object and schema
    class MockPagination:
        def __init__(self):
            self.items = [Mock() for _ in range(3)]
            self.page = 1
            self.per_page = 5
            self.pages = 2
            self.total = 8
    
    class MockSchema:
        def dump(self, items):
            return [{'id': f'schema-item{i}'} for i in range(len(items))]
    
    pagination = MockPagination()
    schema = MockSchema()
    
    # Format response
    response = format_pagination_response(pagination, schema)
    
    # Check response
    assert 'items' in response
    assert len(response['items']) == 3
    assert response['items'][0] == {'id': 'schema-item0'}
    assert response['items'][1] == {'id': 'schema-item1'}
    assert response['items'][2] == {'id': 'schema-item2'}
