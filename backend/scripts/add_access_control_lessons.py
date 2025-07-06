"""
Script to add Broken Access Control lessons to the module.

This script uses the database models directly to add lessons to the Broken Access Control module.
Run this script from the backend directory with: python scripts/add_access_control_lessons.py
"""
import sys
import os
import uuid
from datetime import datetime

# Add the parent directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.db import db
from models.module import Module
from models.lesson import Lesson
from app import create_app

# Create Flask app with database connection
app = create_app()

# Module ID (from test results)
ACCESS_CONTROL_MODULE_ID = '70962c4e-4ed9-11f0-8cc9-26298fe937f6'

# First two Broken Access Control module lessons
access_control_lessons_part1 = [
    {
        "title": "Understanding Access Control",
        "slug": "understanding-access-control",
        "description": "Learn the fundamentals of access control and its importance in web security.",
        "content_type": "markdown",
        "content": """# Understanding Access Control

## Introduction to Access Control

Access control is a security technique that regulates who or what can view or use resources in a computing environment. It is a fundamental security concept that minimizes risk to the business or organization.

## Types of Access Control

### Discretionary Access Control (DAC)
In DAC, the owner of a resource determines who can access it. For example, file permissions in operating systems where the file owner can set who can read, write, or execute the file.

### Mandatory Access Control (MAC)
MAC enforces access control based on regulations mandated by a central authority. Users cannot override these rules. Often used in highly secure environments like military systems.

### Role-Based Access Control (RBAC)
RBAC assigns permissions to specific roles, and users are assigned to those roles. Most common in enterprise applications. For example, "Admin", "Editor", and "Viewer" roles with different permission levels.

### Attribute-Based Access Control (ABAC)
ABAC uses attributes (user attributes, resource attributes, environment attributes) to determine access rights. More flexible than RBAC as it can consider multiple factors for access decisions.

## Common Access Control Vulnerabilities

1. **Insecure Direct Object References (IDOR)**: Allowing users to access resources directly via their identifiers without proper authorization checks.

2. **Missing Function Level Access Control**: When an application doesn't check authorization at the function level, allowing users to access functionality they shouldn't have access to.

3. **Privilege Escalation**: Vulnerabilities that allow users to gain elevated access to resources that should be protected.

4. **Forced Browsing**: Attempting to access resources that are not referenced by the application but still available.

## Example of an Access Control Vulnerability

Consider a simple application with an API endpoint to fetch user data:

```
GET /api/users/123
```

If the application doesn't properly verify that the requesting user has permission to access user ID 123's data, any authenticated user could potentially access any other user's data by simply changing the ID in the URL.

In the next lesson, we'll examine Broken Access Control vulnerabilities in detail and learn how to identify them in web applications.""",
        "order_index": 0,
        "is_active": True
    },
    {
        "title": "Broken Access Control Vulnerabilities",
        "slug": "broken-access-control-vulnerabilities",
        "description": "Learn about common access control vulnerabilities and how they can be exploited.",
        "content_type": "markdown",
        "content": """# Broken Access Control Vulnerabilities

## What is Broken Access Control?

Broken Access Control occurs when restrictions on what authenticated users are allowed to do are not properly enforced. It is one of the most common and impactful web application security vulnerabilities, consistently ranking high in the OWASP Top 10.

## Common Broken Access Control Vulnerabilities

### 1. Insecure Direct Object References (IDOR)

IDOR occurs when an application provides direct access to objects based on user-supplied input without proper authorization checks.

**Example:**
A banking application might use a simple URL structure to access account information:
```
https://bank.example.com/account.php?account_id=12345
```

If a user can simply change the `account_id` parameter to access someone else's account without proper authorization checks, that's an IDOR vulnerability.

**Real-world impact:**
In 2019, a major food delivery service had an IDOR vulnerability that allowed attackers to access other users' personal information including names, addresses, and partial payment details.

### 2. Bypassing Authorization Checks

Some applications perform access control checks only on certain pages but not consistently throughout the application.

**Example:**
An application might check if a user has admin privileges when displaying the admin panel, but not when processing admin-specific API requests:

```javascript
// Front-end check (can be bypassed)
if (user.isAdmin) {
  showAdminPanel();
}

// API endpoint missing proper check
app.post('/api/delete-user', (req, res) => {
  // Missing verification that the current user is an admin
  deleteUser(req.body.userId);
  res.json({success: true});
});
```

### 3. Elevation of Privilege

This occurs when a user can change their access permissions to a higher level than intended.

**Example:**
A user modifies their JWT token by changing the role from "user" to "admin":

Original JWT payload:
```json
{
  "user_id": 123,
  "username": "john",
  "role": "user"
}
```

Modified JWT payload:
```json
{
  "user_id": 123,
  "username": "john",
  "role": "admin"
}
```

### 4. Metadata Manipulation

Changing metadata in requests to bypass access controls.

**Example:**
Modifying HTTP headers or parameters that are used for access control decisions:

```
POST /api/article HTTP/1.1
Host: example.com
Content-Type: application/json
X-User-Role: user

{
  "title": "My Article",
  "content": "Article content",
  "operation": "create"
}
```

By changing `X-User-Role` to `admin`, an attacker might gain additional privileges if the server trusts this header.

### 5. CORS Misconfiguration

Cross-Origin Resource Sharing (CORS) misconfigurations can allow unintended domains to make authenticated requests to your API.

**Example:**
An overly permissive CORS configuration:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

This configuration allows any website to make authenticated requests to your API.

## Detection Techniques

1. **Manual testing**: Attempt to access resources or functions that should be restricted
2. **Parameter manipulation**: Modify IDs, paths, and other parameters
3. **Role switching**: Test as different user types to ensure proper access separation
4. **Automated scanning**: Use security tools like OWASP ZAP or Burp Suite
5. **Code review**: Look for missing authorization checks in controller logic

In the next lesson, we'll learn how to implement proper access control mechanisms to prevent these vulnerabilities.""",
        "order_index": 1,
        "is_active": True
    }
]

def add_lessons_to_module(module_id, lessons):
    """Add lessons to a module."""
    # Check if module exists
    module = Module.query.get(module_id)
    if not module:
        print(f"Module with ID {module_id} not found.")
        return False
    
    print(f"Adding lessons to module: {module.name} (ID: {module_id})")
    
    # Add each lesson
    for lesson_data in lessons:
        # Check if lesson with this slug already exists
        existing = Lesson.query.filter_by(module_id=module_id, slug=lesson_data["slug"]).first()
        if existing:
            print(f"Lesson with slug '{lesson_data['slug']}' already exists in this module. Skipping.")
            continue
        
        # Create new lesson
        lesson = Lesson(
            id=str(uuid.uuid4()),
            module_id=module_id,
            title=lesson_data["title"],
            slug=lesson_data["slug"],
            description=lesson_data["description"],
            content_type=lesson_data["content_type"],
            content=lesson_data["content"],
            order_index=lesson_data["order_index"],
            is_active=lesson_data["is_active"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.session.add(lesson)
        print(f"Added lesson: {lesson.title}")
    
    # Commit changes
    db.session.commit()
    print(f"Successfully added {len(lessons)} lessons to module {module.name}")
    return True

if __name__ == "__main__":
    with app.app_context():
        # Add Broken Access Control module lessons (part 1)
        add_lessons_to_module(ACCESS_CONTROL_MODULE_ID, access_control_lessons_part1)
        print("Part 1 of Broken Access Control lessons added successfully!")
