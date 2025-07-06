#!/usr/bin/env python3
"""
Create an admin user in the database.
"""
from datetime import datetime

from models.db import db
from models.user import User
from models.activity_log import ActivityLog
from app import create_app

# Create Flask app with application context
app = create_app('development')

with app.app_context():
    # Check if admin user already exists
    existing_user = User.query.filter_by(username='admin').first()
    
    if existing_user:
        print(f"Admin user already exists with ID: {existing_user.id}")
    else:
        # Create admin user
        admin = User(
            username='admin',
            email='admin@sadp.com',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_active=True,
            created_at=datetime.utcnow()
        )
        admin.password = 'admin123'  # This will hash the password
        
        # Log activity
        activity = ActivityLog(
            user_id=admin.id,
            action='register',
            entity_type='user',
            entity_id=admin.id,
            ip_address='127.0.0.1',
            details={'method': 'script-creation'}
        )
        
        # Add to database
        db.session.add(admin)
        db.session.add(activity)
        db.session.commit()
        
        print(f"Created admin user with ID: {admin.id}")
        print(f"Username: admin")
        print(f"Password: admin123")
