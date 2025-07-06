"""
Intentionally vulnerable CSRF implementations for demonstrating Cross-Site Request Forgery vulnerabilities.

WARNING: This code contains intentional security vulnerabilities for educational purposes.
DO NOT use these functions in a production environment or with sensitive data.
"""
import sqlite3
import os
import json
from datetime import datetime
from flask import current_app, request, render_template_string


def get_db_connection():
    """
    Create a SQLite database connection for educational demonstrations.
    
    Returns:
        SQLite database connection object
    """
    db_path = os.path.join(current_app.config['INSTANCE_PATH'], 'csrf_demo.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def setup_demo_db():
    """
    Initialize the demo database with sample data for CSRF exercises.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        balance REAL NOT NULL DEFAULT 1000.0,
        email TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user INTEGER NOT NULL,
        to_user INTEGER NOT NULL,
        amount REAL NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user) REFERENCES user_accounts (id),
        FOREIGN KEY (to_user) REFERENCES user_accounts (id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        setting_name TEXT NOT NULL,
        setting_value TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user_accounts (id)
    )
    ''')
    
    # Insert sample data
    cursor.execute("DELETE FROM transfers")
    cursor.execute("DELETE FROM user_settings")
    cursor.execute("DELETE FROM user_accounts")
    
    # Sample user accounts
    accounts = [
        ('alice', 1000.0, 'alice@example.com'),
        ('bob', 1000.0, 'bob@example.com'),
        ('charlie', 1000.0, 'charlie@example.com'),
        ('mallory', 1000.0, 'mallory@example.com'),
    ]
    cursor.executemany(
        "INSERT INTO user_accounts (username, balance, email) VALUES (?, ?, ?)",
        accounts
    )
    
    # Sample settings
    settings = [
        (1, 'notification_email', 'alice@example.com'),
        (1, 'two_factor_auth', 'false'),
        (2, 'notification_email', 'bob@example.com'),
        (2, 'two_factor_auth', 'false'),
        (3, 'notification_email', 'charlie@example.com'),
        (3, 'two_factor_auth', 'true'),
    ]
    cursor.executemany(
        "INSERT INTO user_settings (user_id, setting_name, setting_value) VALUES (?, ?, ?)",
        settings
    )
    
    conn.commit()
    conn.close()


# =========== Vulnerable Functions ===========

def vulnerable_transfer_funds(from_user_id, to_user_id, amount):
    """
    VULNERABLE: CSRF vulnerability in fund transfer functionality.
    No CSRF token validation is performed.
    
    Args:
        from_user_id (int): ID of user sending funds
        to_user_id (int): ID of user receiving funds
        amount (float): Amount to transfer
        
    Returns:
        dict: Transfer result
        
    Example exploitation:
        Create a form that submits to this endpoint on another website
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Convert amount to float
        amount = float(amount)
        
        if amount <= 0:
            return {'success': False, 'error': 'Amount must be greater than zero'}
            
        # Check if users exist
        cursor.execute("SELECT * FROM user_accounts WHERE id = ?", (from_user_id,))
        from_user = cursor.fetchone()
        
        if not from_user:
            return {'success': False, 'error': 'Source account not found'}
            
        cursor.execute("SELECT * FROM user_accounts WHERE id = ?", (to_user_id,))
        to_user = cursor.fetchone()
        
        if not to_user:
            return {'success': False, 'error': 'Destination account not found'}
            
        # Check if source user has sufficient funds
        if from_user['balance'] < amount:
            return {'success': False, 'error': 'Insufficient funds'}
            
        # Perform transfer
        cursor.execute(
            "UPDATE user_accounts SET balance = balance - ? WHERE id = ?",
            (amount, from_user_id)
        )
        
        cursor.execute(
            "UPDATE user_accounts SET balance = balance + ? WHERE id = ?",
            (amount, to_user_id)
        )
        
        # Log transfer
        cursor.execute(
            "INSERT INTO transfers (from_user, to_user, amount) VALUES (?, ?, ?)",
            (from_user_id, to_user_id, amount)
        )
        
        conn.commit()
        
        # Get updated balances
        cursor.execute("SELECT balance FROM user_accounts WHERE id = ?", (from_user_id,))
        new_from_balance = cursor.fetchone()['balance']
        
        cursor.execute("SELECT balance FROM user_accounts WHERE id = ?", (to_user_id,))
        new_to_balance = cursor.fetchone()['balance']
        
        return {
            'success': True,
            'message': f'Successfully transferred ${amount:.2f}',
            'new_balance': new_from_balance,
            'from_user_id': from_user_id,
            'to_user_id': to_user_id
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Transfer error: {str(e)}")
        return {'success': False, 'error': str(e)}
        
    finally:
        conn.close()


def vulnerable_update_email(user_id, new_email):
    """
    VULNERABLE: CSRF vulnerability in email update functionality.
    No CSRF token validation is performed.
    
    Args:
        user_id (int): ID of user updating email
        new_email (str): New email address
        
    Returns:
        dict: Update result
        
    Example exploitation:
        Create a form that submits to this endpoint on another website
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute("SELECT * FROM user_accounts WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return {'success': False, 'error': 'User not found'}
            
        # Simple email validation
        if '@' not in new_email or '.' not in new_email:
            return {'success': False, 'error': 'Invalid email format'}
            
        # Update email
        cursor.execute(
            "UPDATE user_accounts SET email = ? WHERE id = ?",
            (new_email, user_id)
        )
        
        # Also update notification email in settings
        cursor.execute(
            "UPDATE user_settings SET setting_value = ? WHERE user_id = ? AND setting_name = 'notification_email'",
            (new_email, user_id)
        )
        
        conn.commit()
        
        return {
            'success': True,
            'message': 'Email updated successfully',
            'user_id': user_id,
            'new_email': new_email
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Email update error: {str(e)}")
        return {'success': False, 'error': str(e)}
        
    finally:
        conn.close()


def vulnerable_toggle_2fa(user_id, enabled):
    """
    VULNERABLE: CSRF vulnerability in security settings update.
    No CSRF token validation is performed.
    
    Args:
        user_id (int): ID of user updating settings
        enabled (bool): Whether to enable two-factor authentication
        
    Returns:
        dict: Update result
        
    Example exploitation:
        Create a form that submits to this endpoint on another website
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute("SELECT * FROM user_accounts WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return {'success': False, 'error': 'User not found'}
            
        # Convert enabled to string representation
        enabled_str = str(enabled).lower()
        
        # Update setting
        cursor.execute(
            "SELECT * FROM user_settings WHERE user_id = ? AND setting_name = 'two_factor_auth'",
            (user_id,)
        )
        setting = cursor.fetchone()
        
        if setting:
            cursor.execute(
                "UPDATE user_settings SET setting_value = ? WHERE user_id = ? AND setting_name = 'two_factor_auth'",
                (enabled_str, user_id)
            )
        else:
            cursor.execute(
                "INSERT INTO user_settings (user_id, setting_name, setting_value) VALUES (?, ?, ?)",
                (user_id, 'two_factor_auth', enabled_str)
            )
        
        conn.commit()
        
        return {
            'success': True,
            'message': f"Two-factor authentication {'enabled' if enabled else 'disabled'}",
            'user_id': user_id,
            'two_factor_auth': enabled
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"2FA update error: {str(e)}")
        return {'success': False, 'error': str(e)}
        
    finally:
        conn.close()


def generate_vulnerable_form(action_url, form_fields, method="POST"):
    """
    Generate an HTML form that demonstrates CSRF vulnerability.
    
    Args:
        action_url (str): URL to submit the form to
        form_fields (dict): Fields to include in the form
        method (str): HTTP method (GET or POST)
        
    Returns:
        str: HTML form
    """
    fields_html = ""
    for name, value in form_fields.items():
        fields_html += f'<input type="hidden" name="{name}" value="{value}">\n    '
    
    form_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Win a Prize!</title>
    <style>
        body {{ font-family: Arial, sans-serif; text-align: center; padding: 20px; }}
        .prize-button {{ background-color: #ff5722; color: white; border: none; padding: 15px 30px; font-size: 18px; cursor: pointer; border-radius: 5px; }}
        .prize-button:hover {{ background-color: #e64a19; }}
    </style>
</head>
<body>
    <h1>Congratulations! You've Been Selected!</h1>
    <p>Click the button below to claim your prize!</p>
    <form id="csrf-form" action="{action_url}" method="{method}">
    {fields_html}
    <button type="submit" class="prize-button">Claim Your Prize Now!</button>
    </form>
    <p><small>Limited time offer. Terms and conditions apply.</small></p>
</body>
</html>
"""
    return form_html


def vulnerable_get_demonstration(user_id):
    """
    Demonstrate GET-based CSRF using images or resources that execute a request.
    
    Args:
        user_id (int): ID of the target user
        
    Returns:
        dict: Demonstration data
    """
    # Example CSRF GET-based attack
    # <img src="http://bank.com/transfer?to=attacker&amount=1000" width="0" height="0">
    
    email_update_url = f"/api/modules/csrf/vulnerable/update-email?user_id={user_id}&new_email=hacked%40attacker.com"
    
    img_tag = f'<img src="{email_update_url}" width="1" height="1" style="display:none">'
    
    return {
        'method': 'GET',
        'vulnerability_type': 'CSRF via Resource Loading',
        'description': 'This demonstrates how a CSRF attack can be executed by loading resources like images',
        'example_html': img_tag,
        'educational_note': '''
            GET-based CSRF attacks can be executed through:
            1. Image tags (<img>)
            2. Stylesheet links (<link>)
            3. Script tags (<script>)
            4. Iframes (<iframe>)
            
            Browsers automatically send cookies/session data when loading these resources, 
            executing the request with the user's credentials.
        '''
    }
