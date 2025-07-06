# SADP Backend Usage Guide

This document provides comprehensive documentation for the Secure Application Demo Platform (SADP) backend application, including setup instructions, architecture overview, module structure, and development guidelines.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Database Configuration](#database-configuration)
4. [Authentication System](#authentication-system)
5. [API Resources](#api-resources)
6. [Vulnerability Modules](#vulnerability-modules)
7. [Customizing and Extending](#customizing-and-extending)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Python 3.8+
- MySQL or PostgreSQL database
- Virtual environment tool (recommended)

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd /path/to/sadp/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure the database connection in `config.py` (see [Database Configuration](#database-configuration)).

5. Create database tables:
   ```bash
   python init_db.py
   ```

6. Create test users:
   ```bash
   python create_test_users.py
   ```

7. Start the development server:
   ```bash
   python -m flask run --port=5001
   ```
   
   The API will be available at `http://localhost:5001/api`.

## Project Structure

```
backend/
├── api/                # API endpoints and resources
│   ├── auth.py         # Authentication resources
│   ├── users.py        # User management resources
│   ├── modules.py      # Module resources
│   ├── lessons.py      # Lesson resources
│   ├── exercises.py    # Exercise resources
│   ├── progress.py     # Progress tracking resources
│   └── routes.py       # API route registration
├── models/             # Database models
│   ├── db.py           # Database connection
│   ├── user.py         # User model
│   ├── module.py       # Module model
│   ├── lesson.py       # Lesson model
│   ├── exercise.py     # Exercise model
│   ├── progress.py     # Progress tracking models
│   ├── user_session.py # User session model
│   └── activity_log.py # Activity logging model
├── modules/            # Vulnerability demonstration modules
│   ├── sql_injection/  # SQL Injection module
│   ├── xss/            # Cross-Site Scripting module
│   ├── csrf/           # Cross-Site Request Forgery module
│   └── http_headers/   # HTTP Header Analysis module
├── utils/              # Utility functions
├── app.py              # Application factory
├── config.py           # Configuration settings
└── requirements.txt    # Project dependencies
```

## Database Configuration

The application uses SQLAlchemy for database operations. Database configuration is handled in `config.py`:

### Default Configuration

```python
# Database settings
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/sadp')
SQLALCHEMY_TRACK_MODIFICATIONS = False
```

### Supported Database Systems

- **MySQL**: Use the connection string format `mysql+pymysql://username:password@host:port/database_name`
- **PostgreSQL**: Use the connection string format `postgresql://username:password@host:port/database_name`
- **SQLite**: Use the connection string format `sqlite:///path/to/database.db`

### Environment Variables

You can configure the database connection using the following environment variables:

- `DATABASE_URL`: Full database connection string
- `DATABASE_USER`: Database username
- `DATABASE_PASSWORD`: Database password
- `DATABASE_HOST`: Database host
- `DATABASE_PORT`: Database port
- `DATABASE_NAME`: Database name

## Authentication System

### JWT Authentication

The backend uses JWT (JSON Web Tokens) for authentication:

- **Access Token**: Short-lived token (1 hour) for API authentication
- **Refresh Token**: Long-lived token (30 days) to obtain new access tokens

JWT settings are configured in `config.py`:

```python
# JWT settings
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt_dev_secret_key')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
```

### User Model

The User model (`models/user.py`) provides the following features:

- Secure password hashing using `werkzeug.security`
- Role-based access control (user, instructor, admin)
- User profile information
- Activity tracking

### User Session Management

User sessions are tracked in the `user_sessions` table:

- Each login creates a new session with the refresh token
- Sessions expire based on the JWT refresh token expiration
- Sessions can be invalidated on logout

## API Resources

### Resource Structure

API resources are implemented using Flask-RESTful:

```python
class ResourceName(Resource):
    @jwt_required()  # Requires authentication
    def get(self, resource_id):
        # Handle GET request
        return data, 200

    @jwt_required()
    def post(self):
        # Handle POST request
        return data, 201

    @jwt_required()
    def put(self, resource_id):
        # Handle PUT request
        return data, 200

    @jwt_required()
    def delete(self, resource_id):
        # Handle DELETE request
        return {"message": "Resource deleted"}, 200
```

### Available Resources

- **AuthLoginResource**: User login
- **AuthRegisterResource**: User registration
- **AuthRefreshResource**: Token refresh
- **AuthLogoutResource**: User logout
- **UserResource**: Individual user operations
- **UserListResource**: Operations on multiple users
- **ModuleResource**: Individual module operations
- **ModuleListResource**: Operations on multiple modules
- **LessonResource**: Individual lesson operations
- **LessonListResource**: Operations on module lessons
- **ExerciseResource**: Individual exercise operations
- **ExerciseSubmissionResource**: Exercise submission handling
- **UserProgressResource**: User progress tracking
- **LessonProgressResource**: Lesson progress statistics

## Vulnerability Modules

The backend includes several modules that demonstrate common security vulnerabilities:

### SQL Injection Module

Located in `modules/sql_injection/`, this module demonstrates:

- Vulnerable SQL query construction
- Secure SQL query parameterization
- SQLite demonstration database

Components:
- `vulnerable.py`: Demonstrates vulnerable SQL queries
- `secure.py`: Shows proper parameterized queries
- `controller.py`: API endpoints for both approaches

### XSS (Cross-Site Scripting) Module

Located in `modules/xss/`, this module demonstrates:

- Reflected XSS vulnerabilities
- Stored XSS vulnerabilities
- DOM-based XSS vulnerabilities
- XSS prevention techniques

Components:
- `vulnerable.py`: Demonstrates vulnerable code
- `secure.py`: Shows proper input sanitization
- `controller.py`: API endpoints for demonstrations

### CSRF (Cross-Site Request Forgery) Module

Located in `modules/csrf/`, this module demonstrates:

- CSRF vulnerability examples
- Token-based CSRF protection
- Same-site cookie protection

Components:
- `vulnerable.py`: Demonstrates vulnerable endpoints
- `secure.py`: Shows proper CSRF protection
- `controller.py`: API endpoints for both approaches

### HTTP Headers Module

Located in `modules/http_headers/`, this module provides:

- HTTP header security analysis
- Best practices recommendations
- Security headers implementation examples

Components:
- `analyzer.py`: Header analysis implementation
- `controller.py`: API endpoints for header analysis

## Customizing and Extending

### Adding a New API Resource

1. Create a new file in the `api` directory:

```python
# api/new_resource.py
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from models.db import db
from models.your_model import YourModel

class NewResource(Resource):
    @jwt_required()
    def get(self, resource_id):
        resource = YourModel.query.get(resource_id)
        if not resource:
            return {"message": "Resource not found"}, 404
        return resource.to_dict(), 200

    @jwt_required()
    def post(self):
        data = request.get_json()
        # Create new resource
        return {"message": "Resource created"}, 201
```

2. Register the resource in `api/routes.py`:

```python
from api.new_resource import NewResource

def register_routes(app):
    # ... existing code ...
    
    # Add your new resource
    api.add_resource(NewResource, '/new-resource/<string:resource_id>')
```

### Adding a New Vulnerability Module

1. Create a new directory in the `modules` directory:

```
modules/
└── new_module/
    ├── __init__.py
    ├── vulnerable.py
    ├── secure.py
    └── controller.py
```

2. Implement the module components:

```python
# modules/new_module/__init__.py
from . import controller

def init_module(app):
    """Initialize the new module with the Flask app."""
    controller.register_routes(app)
```

3. Register the module in `modules/__init__.py`:

```python
from . import sql_injection, xss, csrf, http_headers, new_module

def init_modules(app):
    """Initialize all vulnerability modules."""
    sql_injection.init_module(app)
    xss.init_module(app)
    csrf.init_module(app)
    http_headers.init_module(app)
    new_module.init_module(app)
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify database credentials in `config.py`
   - Check if the database server is running
   - Ensure the database exists and is accessible

2. **JWT Token Issues**:
   - Check `JWT_SECRET_KEY` configuration
   - Verify token expiration settings
   - Look for clock synchronization issues

3. **CORS Issues**:
   - Ensure CORS settings match frontend origin (`http://localhost:3001`)
   - Check that CORS headers are being returned in responses
   - Look for preflight request handling issues

### Logging

The application uses Flask's built-in logging:

```python
app.logger.debug('Debug message')
app.logger.info('Info message')
app.logger.warning('Warning message')
app.logger.error('Error message')
```

### Database Migrations

If you need to modify the database schema, use Flask-Migrate:

1. Initialize migrations (if not done):
   ```bash
   flask db init
   ```

2. Create a migration:
   ```bash
   flask db migrate -m "Description of changes"
   ```

3. Apply the migration:
   ```bash
   flask db upgrade
   ```

### Testing

Run tests using pytest:

```bash
python -m pytest tests/
```

### Deployment Considerations

When deploying to production:

1. Set proper environment variables:
   - `FLASK_ENV=production`
   - `SECRET_KEY` (strong, random key)
   - `JWT_SECRET_KEY` (strong, random key)
   - `DATABASE_URL` (production database)

2. Use a production-ready WSGI server:
   ```bash
   pip install gunicorn
   gunicorn -w 4 "app:create_app('production')" --bind 0.0.0.0:5000
   ```

3. Set up HTTPS with a proper certificate

4. Implement rate limiting for sensitive endpoints

5. Enable enhanced security headers (HSTS, CSP, etc.)
