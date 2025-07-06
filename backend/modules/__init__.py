"""
Vulnerability modules package initializer.

This package contains educational modules for demonstrating various security vulnerabilities
and their secure counterparts.
"""

def init_modules(app):
    """
    Initialize and register all vulnerability modules with the Flask application.
    
    Args:
        app: Flask application instance
    """
    # Import controllers here to avoid circular imports
    from .sql_injection.controller import register_module as register_sql_injection
    from .xss.controller import register_module as register_xss
    from .csrf.controller import register_module as register_csrf
    from .http_headers.controller import register_module as register_http_headers
    
    # Register all modules
    with app.app_context():
        register_sql_injection(app)
        register_xss(app)
        register_csrf(app)
        register_http_headers(app)
        app.logger.info("All vulnerability modules registered")
