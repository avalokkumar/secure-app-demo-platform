#!/usr/bin/env python3
"""
Main application entry point for the Secure Application Demo Platform (SADP) backend.
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from config import config_by_name
from models.db import db
from api.routes import register_routes
from modules import init_modules
from swagger import register_swagger_ui

def create_app(config_name='development'):
    """
    Create and configure the Flask application instance.
    
    Args:
        config_name: Configuration environment (development, testing, production)
        
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    # Setup migrations
    Migrate(app, db)
    
    # Configure CORS with support for iframe embedding and credentials
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ALLOWED_ORIGINS'],
            "supports_credentials": True
        },
        r"/api/docs/*": {
            "origins": app.config['CORS_ALLOWED_ORIGINS'],
            "supports_credentials": True,
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "X-Frame-Options"]
        }
    })
    
    # Setup JWT
    jwt = JWTManager(app)
    
    # Register API routes
    register_routes(app)
    
    # Initialize vulnerability demonstration modules
    init_modules(app)
    
    # Health check routes
    @app.route('/health')
    @app.route('/api/health-check')  # Additional route for frontend detection
    def health_check():
        return {'status': 'healthy'}, 200
    
    # Register Swagger UI for API documentation
    register_swagger_ui(app)
    
    return app

if __name__ == '__main__':
    # Get configuration name from environment variable or default to development
    config_name = os.getenv('FLASK_CONFIG', 'development')
    
    # Create application instance
    app = create_app(config_name)
    
    # Run application
    app.run(host='0.0.0.0', port=5001)
