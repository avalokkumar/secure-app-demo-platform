#!/usr/bin/env python3
"""
Database initialization script for the SADP application.

This script creates the basic tables needed for authentication and adds a test user.
"""
import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.db import db
from models.user import User
from models.user_session import UserSession
from models.activity_log import ActivityLog

from app import create_app


def init_db():
    """Initialize the database with tables and a test user."""
    app = create_app('development')
    
    with app.app_context():
        print("Creating database tables...")
        # Create tables
        db.create_all()
        
        # Check if test user exists
        if not User.query.filter_by(username='admin').first():
            print("Creating test user (admin/admin123)...")
            # Create a test user
            user = User(
                username='admin',
                email='admin@sadp.com',
                first_name='Admin',
                last_name='User',
                role='admin',
                is_active=True,
                created_at=datetime.utcnow()
            )
            user.password = 'admin123'  # This will hash the password
            
            # Create activity log for user creation
            activity = ActivityLog(
                user_id=user.id,
                action='register',
                entity_type='user',
                entity_id=user.id,
                ip_address='127.0.0.1',
                details={'method': 'script-creation'}
            )
            
            db.session.add(user)
            db.session.add(activity)
            db.session.commit()
            print(f"Created admin user with ID: {user.id}")
        else:
            print("Admin user already exists")
        
        # Print table info
        print("\nDatabase tables created:")
        for table in db.metadata.tables:
            print(f" - {table}")
        
        print("\nDatabase initialization complete.")


if __name__ == '__main__':
    init_db()
