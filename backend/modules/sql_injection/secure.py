"""
Secure SQL implementations for demonstrating proper protection against SQL injection vulnerabilities.

This module provides secure alternatives to the vulnerable functions in the vulnerable.py file,
showing best practices for preventing SQL injection attacks.
"""
import sqlite3
import os
from flask import current_app
import pymysql


def get_db_connection_sqlite():
    """
    Create a SQLite database connection for educational demonstrations.
    
    Returns:
        SQLite database connection object
    """
    db_path = os.path.join(current_app.config['INSTANCE_PATH'], 'demo.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def get_db_connection_mysql():
    """
    Create a MySQL database connection for educational demonstrations.
    
    Returns:
        MySQL database connection object
    """
    conn = pymysql.connect(
        host=current_app.config.get('DEMO_DB_HOST', 'localhost'),
        user=current_app.config.get('DEMO_DB_USER', 'root'),
        password=current_app.config.get('DEMO_DB_PASSWORD', ''),
        database=current_app.config.get('DEMO_DB_NAME', 'sadp'),
        cursorclass=pymysql.cursors.DictCursor
    )
    return conn


# =========== Secure Functions ===========

def secure_login(username, password):
    """
    SECURE: SQL injection prevention in login function using parameterized queries.
    
    Args:
        username (str): Username
        password (str): Password
        
    Returns:
        dict: User data if login successful, None otherwise
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Secure: Using parameterized query with placeholders
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    current_app.logger.info("Executing secure login query with parameterized values")
    
    try:
        cursor.execute(query, (username, password))
        user = cursor.fetchone()
        if user:
            return dict(user)
        return None
    except Exception as e:
        current_app.logger.error(f"Error in secure login: {str(e)}")
        return None
    finally:
        conn.close()


def secure_search_products(term):
    """
    SECURE: SQL injection prevention in product search function using parameterized queries.
    
    Args:
        term (str): Search term
        
    Returns:
        list: Matching products
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Secure: Using parameterized query with placeholders
    query = "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?"
    search_term = f"%{term}%"
    current_app.logger.info("Executing secure product search with parameterized values")
    
    try:
        cursor.execute(query, (search_term, search_term))
        products = cursor.fetchall()
        return [dict(product) for product in products]
    except Exception as e:
        current_app.logger.error(f"Error in secure product search: {str(e)}")
        return []
    finally:
        conn.close()


def secure_get_user_by_id(user_id):
    """
    SECURE: SQL injection prevention in get user by ID function using parameterized queries.
    
    Args:
        user_id (int): User ID
        
    Returns:
        dict: User data
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Secure: Using parameterized query with placeholders and proper type conversion
    try:
        # Validate user_id is a valid integer
        user_id_int = int(user_id)
        
        query = "SELECT id, username, email, is_admin FROM users WHERE id = ?"
        current_app.logger.info("Executing secure get user by ID with parameterized values")
        
        cursor.execute(query, (user_id_int,))
        user = cursor.fetchone()
        if user:
            return dict(user)
        return None
    except ValueError:
        # Handle invalid input (non-integer user_id)
        current_app.logger.error(f"Invalid user ID format: {user_id}")
        return None
    except Exception as e:
        current_app.logger.error(f"Error in secure get user: {str(e)}")
        return None
    finally:
        conn.close()


def secure_update_profile(user_id, email):
    """
    SECURE: SQL injection prevention in update profile function using parameterized queries.
    
    Args:
        user_id (int): User ID
        email (str): New email
        
    Returns:
        bool: Success status
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Secure: Using parameterized query with placeholders
    query = "UPDATE users SET email = ? WHERE id = ?"
    current_app.logger.info("Executing secure update profile with parameterized values")
    
    try:
        # Validate user_id is a valid integer
        user_id_int = int(user_id)
        
        cursor.execute(query, (email, user_id_int))
        conn.commit()
        return cursor.rowcount > 0
    except ValueError:
        # Handle invalid input (non-integer user_id)
        current_app.logger.error(f"Invalid user ID format: {user_id}")
        return False
    except Exception as e:
        current_app.logger.error(f"Error in secure update profile: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()


def secure_dynamic_query(table, column, value):
    """
    SECURE: SQL injection prevention for dynamic queries using validated table/column names.
    
    Args:
        table (str): Table name
        column (str): Column name
        value (str): Value to match
        
    Returns:
        list: Query results
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Secure: Whitelist validation for table and column names
    allowed_tables = {'users', 'products'}
    table_column_mapping = {
        'users': {'id', 'username', 'email', 'is_admin'},
        'products': {'id', 'name', 'description', 'price', 'category'}
    }
    
    # Validate table name
    if table not in allowed_tables:
        current_app.logger.error(f"Invalid table name: {table}")
        return []
    
    # Validate column name
    if column not in table_column_mapping.get(table, set()):
        current_app.logger.error(f"Invalid column name: {column}")
        return []
    
    # Secure: Using prepared statement with placeholders
    # Note: SQLite doesn't support parameterized table/column names,
    # so we manually validate them instead
    query = f"SELECT * FROM {table} WHERE {column} = ?"
    current_app.logger.info("Executing secure dynamic query with validated table/column names")
    
    try:
        cursor.execute(query, (value,))
        results = cursor.fetchall()
        return [dict(result) for result in results]
    except Exception as e:
        current_app.logger.error(f"Error in secure dynamic query: {str(e)}")
        return []
    finally:
        conn.close()


def secure_check_user_exists(username):
    """
    SECURE: SQL injection prevention for blind SQL injection vulnerability.
    
    Args:
        username (str): Username to check
        
    Returns:
        bool: True if user exists
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Secure: Using parameterized query with placeholders
    query = "SELECT COUNT(*) FROM users WHERE username = ?"
    current_app.logger.info("Executing secure check user exists with parameterized values")
    
    try:
        cursor.execute(query, (username,))
        count = cursor.fetchone()[0]
        return count > 0
    except Exception as e:
        current_app.logger.error(f"Error in secure check user exists: {str(e)}")
        return False
    finally:
        conn.close()


def secure_register(username, password, email):
    """
    SECURE: Protection against second-order SQL injection.
    
    Args:
        username (str): New username
        password (str): Password
        email (str): Email
        
    Returns:
        int: User ID of newly created user, or None on failure
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    try:
        # First query - store user with parameterized query
        cursor.execute(
            "INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, 0)",
            (username, password, email)
        )
        conn.commit()
        
        # Second query - also using parameterized query
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        return user['id'] if user else None
    except Exception as e:
        current_app.logger.error(f"Error in secure register: {str(e)}")
        conn.rollback()
        return None
    finally:
        conn.close()


def use_orm_example():
    """
    BEST PRACTICE: Using an ORM like SQLAlchemy to prevent SQL injection.
    
    This is a demonstration of how using an ORM can automatically protect
    against SQL injection by abstracting away raw SQL queries.
    
    Example with SQLAlchemy:
    ```python
    from models import User
    
    # Get user by ID
    user = User.query.filter(User.id == user_id).first()
    
    # Search products
    products = Product.query.filter(
        (Product.name.like(f'%{search_term}%')) | 
        (Product.description.like(f'%{search_term}%'))
    ).all()
    
    # Update profile
    user = User.query.get(user_id)
    if user:
        user.email = new_email
        db.session.commit()
    ```
    """
    return {
        'info': 'This is a demonstration of using an ORM (Object Relational Mapper)',
        'benefit': 'ORMs automatically use parameterized queries and prevent SQL injection',
        'example': 'Using SQLAlchemy to handle database operations safely'
    }
