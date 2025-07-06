"""
Secure CSRF implementations for demonstrating proper protection against Cross-Site Request Forgery vulnerabilities.

This module provides secure alternatives to the vulnerable functions in the vulnerable.py file,
showing best practices for preventing CSRF attacks.
"""
import sqlite3
import os
import json
import secrets
from datetime import datetime
from flask import current_app, request, render_template_string, session


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


# =========== Secure Functions ===========

def generate_csrf_token():
    """
    Generate a secure CSRF token.
    
    Returns:
        str: CSRF token
    """
    # Generate a random token
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']


def validate_csrf_token(token):
    """
    Validate a CSRF token against the stored token.
    
    Args:
        token (str): CSRF token to validate
        
    Returns:
        bool: True if token is valid
    """
    stored_token = session.get('csrf_token')
    if not stored_token:
        return False
    return secrets.compare_digest(stored_token, token)


def secure_transfer_funds(from_user_id, to_user_id, amount, csrf_token):
    """
    SECURE: Protected against CSRF in fund transfer functionality.
    CSRF token validation is performed.
    
    Args:
        from_user_id (int): ID of user sending funds
        to_user_id (int): ID of user receiving funds
        amount (float): Amount to transfer
        csrf_token (str): CSRF token
        
    Returns:
        dict: Transfer result
    """
    # Validate CSRF token
    if not validate_csrf_token(csrf_token):
        return {'success': False, 'error': 'Invalid CSRF token'}
    
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
            'to_user_id': to_user_id,
            'new_csrf_token': generate_csrf_token()  # Provide a new token for subsequent requests
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Transfer error: {str(e)}")
        return {'success': False, 'error': str(e)}
        
    finally:
        conn.close()


def secure_update_email(user_id, new_email, csrf_token):
    """
    SECURE: Protected against CSRF in email update functionality.
    CSRF token validation is performed.
    
    Args:
        user_id (int): ID of user updating email
        new_email (str): New email address
        csrf_token (str): CSRF token
        
    Returns:
        dict: Update result
    """
    # Validate CSRF token
    if not validate_csrf_token(csrf_token):
        return {'success': False, 'error': 'Invalid CSRF token'}
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute("SELECT * FROM user_accounts WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return {'success': False, 'error': 'User not found'}
            
        # Email validation - more comprehensive than vulnerable version
        if '@' not in new_email or '.' not in new_email or len(new_email) < 5:
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
            'new_email': new_email,
            'new_csrf_token': generate_csrf_token()  # Provide a new token for subsequent requests
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Email update error: {str(e)}")
        return {'success': False, 'error': str(e)}
        
    finally:
        conn.close()


def secure_toggle_2fa(user_id, enabled, csrf_token):
    """
    SECURE: Protected against CSRF in security settings update.
    CSRF token validation is performed.
    
    Args:
        user_id (int): ID of user updating settings
        enabled (bool): Whether to enable two-factor authentication
        csrf_token (str): CSRF token
        
    Returns:
        dict: Update result
    """
    # Validate CSRF token
    if not validate_csrf_token(csrf_token):
        return {'success': False, 'error': 'Invalid CSRF token'}
    
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
            'two_factor_auth': enabled,
            'new_csrf_token': generate_csrf_token()  # Provide a new token for subsequent requests
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"2FA update error: {str(e)}")
        return {'success': False, 'error': str(e)}
        
    finally:
        conn.close()


def generate_secure_form(action_url, form_fields, method="POST"):
    """
    Generate an HTML form that includes CSRF protection.
    
    Args:
        action_url (str): URL to submit the form to
        form_fields (dict): Fields to include in the form
        method (str): HTTP method (GET or POST)
        
    Returns:
        str: HTML form with CSRF protection
    """
    csrf_token = generate_csrf_token()
    
    fields_html = ""
    for name, value in form_fields.items():
        fields_html += f'<input type="hidden" name="{name}" value="{value}">\n    '
    
    # Add CSRF token field
    fields_html += f'<input type="hidden" name="csrf_token" value="{csrf_token}">\n    '
    
    form_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Fund Transfer Form</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        .form-container {{ max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
        .submit-button {{ background-color: #4CAF50; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 3px; }}
        .submit-button:hover {{ background-color: #45a049; }}
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Secure Fund Transfer</h2>
        <form id="secure-form" action="{action_url}" method="{method}">
        {fields_html}
        <p>Transfer funds securely with CSRF protection.</p>
        <button type="submit" class="submit-button">Submit Transfer</button>
        </form>
    </div>
</body>
</html>
"""
    return form_html


def use_samesite_cookies():
    """
    BEST PRACTICE: Using SameSite cookies to prevent CSRF attacks.
    
    Returns:
        dict: Information about SameSite cookies
    """
    return {
        'info': "SameSite cookies provide protection against CSRF attacks at the browser level",
        'options': [
            {
                'value': 'Strict',
                'description': 'Cookies are only sent in first-party context and not with cross-site requests'
            },
            {
                'value': 'Lax',
                'description': 'Cookies are sent with some cross-site requests (e.g., GET navigation)'
            },
            {
                'value': 'None',
                'description': 'Cookies are sent with all requests (must be used with Secure flag)'
            }
        ],
        'example': 'Set-Cookie: sessionid=123abc; SameSite=Lax; Secure; HttpOnly',
        'browser_support': 'Modern browsers support SameSite cookies, but older browsers may not'
    }


def use_custom_request_headers():
    """
    BEST PRACTICE: Using custom request headers to prevent CSRF attacks.
    
    Returns:
        dict: Information about custom request headers
    """
    return {
        'info': "Custom request headers can be used to prevent CSRF attacks",
        'example': 'X-Requested-With: XMLHttpRequest',
        'explanation': '''
            Browsers don't allow custom headers to be set in cross-site requests via HTML forms.
            By checking for these headers on the server, you can verify that the request was made
            from your own JavaScript code and not from a cross-site form submission.
            
            This approach works well for AJAX requests but doesn't protect non-AJAX endpoints.
        ''',
        'implementation': '''
            // Client-side (JavaScript)
            fetch('/api/transfer', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': csrfToken
                },
                // other fetch options
            });
            
            # Server-side (Python)
            if request.headers.get('X-Requested-With') != 'XMLHttpRequest':
                return {'error': 'CSRF validation failed'}, 403
        '''
    }
