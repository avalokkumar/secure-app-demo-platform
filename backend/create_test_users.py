#!/usr/bin/env python3
"""
Create test users in the database with proper password hashing.

This script creates multiple test users with different roles for testing authentication.
"""
from datetime import datetime

from models.db import db
from models.user import User
from models.activity_log import ActivityLog
from app import create_app

# Create Flask app with application context
app = create_app('development')

with app.app_context():
    # Define test users
    test_users = [
        {
            'username': 'admin',
            'email': 'admin@sadp.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin'
        },
        {
            'username': 'instructor',
            'email': 'instructor@sadp.com',
            'password': 'instructor123',
            'first_name': 'Instructor',
            'last_name': 'User',
            'role': 'instructor'
        },
        {
            'username': 'student',
            'email': 'student@sadp.com',
            'password': 'student123',
            'first_name': 'Student',
            'last_name': 'User',
            'role': 'user'
        },
        {
            'username': 'tester',
            'email': 'tester@sadp.com',
            'password': 'tester123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'user'
        }
    ]
    
    print("Creating test users...")
    
    for user_data in test_users:
        # Check if user already exists
        existing_user = User.query.filter_by(username=user_data['username']).first()
        
        if existing_user:
            print(f"User '{user_data['username']}' already exists. Updating password...")
            # Update password with new hashing method
            existing_user.password = user_data['password']
            db.session.commit()
            print(f"Updated password for '{user_data['username']}'")
        else:
            # Create new user
            new_user = User(
                username=user_data['username'],
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role'],
                is_active=True,
                created_at=datetime.utcnow()
            )
            new_user.password = user_data['password']  # This will hash the password
            
            # Create activity log for user creation
            activity = ActivityLog(
                user_id=new_user.id,
                action='register',
                entity_type='user',
                entity_id=new_user.id,
                ip_address='127.0.0.1',
                details={'method': 'script-creation'}
            )
            
            # Add to database
            db.session.add(new_user)
            db.session.add(activity)
            db.session.commit()
            
            print(f"Created new user: '{user_data['username']}' with role '{user_data['role']}'")
    
    print("\nTest users summary:")
    
    # Display all users
    users = User.query.all()
    for user in users:
        print(f"- {user.username} ({user.role}): {user.email}")
    
    print("\nAll users use their username + '123' as the password (e.g., admin123, student123)")
    print("\nTest users creation complete.")
