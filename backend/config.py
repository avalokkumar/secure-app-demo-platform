"""
Configuration settings for the SADP backend application.
"""
import os
from datetime import timedelta

class BaseConfig:
    """Base configuration for all environments."""
    # Application settings
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')  # Set a secure key in production
    
    # Database settings
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost:3306/sadp')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Instance path for SQLite demo databases
    INSTANCE_PATH = os.getenv('INSTANCE_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance'))
    
    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt_dev_secret_key')  # Set a secure key in production
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # API settings
    API_PREFIX = '/api'
    
    # CORS settings
    CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')
    
    # Sandbox settings
    SANDBOX_TIMEOUT = int(os.getenv('SANDBOX_TIMEOUT', 30))  # Maximum execution time in seconds
    SANDBOX_MEMORY_LIMIT = int(os.getenv('SANDBOX_MEMORY_LIMIT', 128))  # Maximum memory usage in MB
    SANDBOX_ENABLE_NETWORK = os.getenv('SANDBOX_ENABLE_NETWORK', 'False').lower() == 'true'


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log SQL queries
    

class TestingConfig(BaseConfig):
    """Testing environment configuration."""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_TEST_URL', 'sqlite:///:memory:')
    

class ProductionConfig(BaseConfig):
    """Production environment configuration."""
    # Production security settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True
    
    # Rate limiting
    RATELIMIT_ENABLED = True
    RATELIMIT_DEFAULT = "200 per day, 50 per hour"
    RATELIMIT_STORAGE_URL = "redis://redis:6379/0"


# Configuration dictionary mapping
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig
}
