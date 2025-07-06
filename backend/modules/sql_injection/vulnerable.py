"""
Intentionally vulnerable SQL implementations for demonstrating SQL injection vulnerabilities.

WARNING: This code contains intentional security vulnerabilities for educational purposes.
DO NOT use these functions in a production environment or with sensitive data.
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


def setup_demo_db():
    """
    Initialize the demo database with sample data for SQL injection exercises.
    """
    # SQLite setup
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT
    )
    ''')
    
    # Insert sample data
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM products")
    
    # Sample users
    users = [
        ('admin', 'supersecret123', 'admin@example.com', 1),
        ('john', 'password123', 'john@example.com', 0),
        ('alice', 'alicespassword', 'alice@example.com', 0),
        ('bob', 'bobspassword', 'bob@example.com', 0),
        ('mallory', 'hackerman', 'mallory@example.com', 0),
    ]
    cursor.executemany(
        "INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, ?)",
        users
    )
    
    # Sample products
    products = [
        ('Laptop', 'High performance laptop with SSD', 1299.99, 'Electronics'),
        ('Smartphone', '5G capable smartphone', 699.99, 'Electronics'),
        ('Headphones', 'Noise cancelling headphones', 149.99, 'Electronics'),
        ('T-shirt', 'Cotton t-shirt', 19.99, 'Clothing'),
        ('Jeans', 'Slim fit jeans', 49.99, 'Clothing'),
        ('Coffee Mug', 'Ceramic coffee mug', 12.99, 'Kitchenware'),
        ('Water Bottle', 'Stainless steel water bottle', 24.99, 'Kitchenware'),
    ]
    cursor.executemany(
        "INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)",
        products
    )
    
    conn.commit()
    conn.close()


# =========== Vulnerable Functions ===========

def vulnerable_login(username, password):
    """
    VULNERABLE: SQL injection in login function.
    
    Args:
        username (str): Username
        password (str): Password
        
    Returns:
        dict: User data if login successful, None otherwise
        
    Example exploitation:
        username: admin' --
        password: anything
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Vulnerable: string concatenation in SQL query
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    current_app.logger.info(f"Executing query: {query}")
    
    try:
        cursor.execute(query)
        user = cursor.fetchone()
        if user:
            return dict(user)
        return None
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable login: {str(e)}")
        return {'error': str(e)}
    finally:
        conn.close()


def vulnerable_search_products(term):
    """
    VULNERABLE: SQL injection in product search function.
    
    Args:
        term (str): Search term
        
    Returns:
        list: Matching products
        
    Example exploitation:
        term: a' UNION SELECT id, username as name, password as description, 1.0 as price, email as category FROM users; --
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Vulnerable: string concatenation in SQL query
    query = f"SELECT * FROM products WHERE name LIKE '%{term}%' OR description LIKE '%{term}%'"
    current_app.logger.info(f"Executing query: {query}")
    
    try:
        cursor.execute(query)
        products = cursor.fetchall()
        return [dict(product) for product in products]
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable product search: {str(e)}")
        return {'error': str(e)}
    finally:
        conn.close()


def vulnerable_get_user_by_id(user_id):
    """
    VULNERABLE: SQL injection in get user by ID function.
    
    Args:
        user_id (str): User ID
        
    Returns:
        dict: User data
        
    Example exploitation:
        user_id: 1 OR 1=1
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Vulnerable: string concatenation in SQL query without proper type conversion
    query = f"SELECT id, username, email, is_admin FROM users WHERE id = {user_id}"
    current_app.logger.info(f"Executing query: {query}")
    
    try:
        cursor.execute(query)
        users = cursor.fetchall()
        return [dict(user) for user in users]
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable get user: {str(e)}")
        return {'error': str(e)}
    finally:
        conn.close()


def vulnerable_update_profile(user_id, email):
    """
    VULNERABLE: SQL injection in update profile function.
    
    Args:
        user_id (str): User ID
        email (str): New email
        
    Returns:
        bool: Success status
        
    Example exploitation:
        user_id: 1
        email: new@example.com', is_admin=1 WHERE id=1; --
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Vulnerable: string concatenation in SQL query
    query = f"UPDATE users SET email = '{email}' WHERE id = {user_id}"
    current_app.logger.info(f"Executing query: {query}")
    
    try:
        cursor.execute(query)
        conn.commit()
        return True
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable update profile: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()


def vulnerable_dynamic_query(table, column, value):
    """
    VULNERABLE: SQL injection through dynamic table/column names.
    
    Args:
        table (str): Table name
        column (str): Column name
        value (str): Value to match
        
    Returns:
        list: Query results
        
    Example exploitation:
        table: users
        column: id
        value: 1 OR 1=1
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Vulnerable: dynamic table and column names in SQL query
    query = f"SELECT * FROM {table} WHERE {column} = '{value}'"
    current_app.logger.info(f"Executing query: {query}")
    
    try:
        cursor.execute(query)
        results = cursor.fetchall()
        return [dict(result) for result in results]
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable dynamic query: {str(e)}")
        return {'error': str(e)}
    finally:
        conn.close()


def blind_vulnerable_check_user_exists(username):
    """
    VULNERABLE: Blind SQL injection vulnerability.
    
    Args:
        username (str): Username to check
        
    Returns:
        bool: True if user exists
        
    Example exploitation:
        username: admin' AND (SELECT SUBSTR(password, 1, 1) FROM users WHERE username='admin')='s' --
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # Vulnerable: string concatenation in SQL query
    query = f"SELECT COUNT(*) FROM users WHERE username = '{username}'"
    current_app.logger.info(f"Executing query: {query}")
    
    try:
        cursor.execute(query)
        count = cursor.fetchone()[0]
        return count > 0
    except Exception as e:
        current_app.logger.error(f"Error in blind vulnerable check: {str(e)}")
        return False
    finally:
        conn.close()


def second_order_vulnerable_register(username, password, email):
    """
    VULNERABLE: Second-order SQL injection through stored username.
    
    Args:
        username (str): New username (potentially contains SQL injection)
        password (str): Password
        email (str): Email
        
    Returns:
        bool: Success status
    """
    conn = get_db_connection_sqlite()
    cursor = conn.cursor()
    
    # First query - storing potentially malicious data
    try:
        cursor.execute(
            "INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, 0)",
            (username, password, email)
        )
        conn.commit()
        
        # Second query - vulnerable to the stored injection
        # The malicious username will be used unsafely in this query
        query = f"SELECT id FROM users WHERE username = '{username}'"
        cursor.execute(query)
        user_id = cursor.fetchone()[0]
        
        return True
    except Exception as e:
        current_app.logger.error(f"Error in second-order vulnerable register: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()
