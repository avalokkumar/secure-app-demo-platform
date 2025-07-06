"""
Request utility functions for the SADP application.
"""
from flask import request


def get_request_ip():
    """
    Get the client IP address from the request.
    
    Returns:
        str: Client IP address
    """
    if request.headers.get('X-Forwarded-For'):
        # Use X-Forwarded-For if available (e.g., behind proxy/load balancer)
        ip = request.headers.get('X-Forwarded-For').split(',')[0].strip()
    else:
        # Fall back to remote address
        ip = request.remote_addr
        
    return ip


def get_request_user_agent():
    """
    Get the user agent from the request.
    
    Returns:
        str: User agent string
    """
    return request.headers.get('User-Agent', '')


def get_pagination_params():
    """
    Extract pagination parameters from request arguments.
    
    Returns:
        tuple: (page, per_page) as integers
    """
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1
        
    try:
        per_page = min(int(request.args.get('per_page', 20)), 100)
    except ValueError:
        per_page = 20
        
    return page, per_page


def format_pagination_response(pagination, schema=None):
    """
    Format a SQLAlchemy pagination object into a standardized response structure.
    
    Args:
        pagination: SQLAlchemy pagination object
        schema: Optional Marshmallow schema to serialize items
        
    Returns:
        dict: Formatted pagination response
    """
    if schema:
        items = schema.dump(pagination.items)
    else:
        # If no schema is provided, assume items have a to_dict method
        items = [item.to_dict() for item in pagination.items]
        
    return {
        'items': items,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
            'total_items': pagination.total
        }
    }
