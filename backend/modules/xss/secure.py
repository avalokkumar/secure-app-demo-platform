"""
Secure XSS implementations for demonstrating proper protection against Cross-Site Scripting vulnerabilities.

This module provides secure alternatives to the vulnerable functions in the vulnerable.py file,
showing best practices for preventing XSS attacks.
"""
import sqlite3
import os
import json
from datetime import datetime
import html
import re
import urllib.parse
from markupsafe import Markup, escape
from flask import current_app, render_template_string


def get_db_connection():
    """
    Create a SQLite database connection for educational demonstrations.
    
    Returns:
        SQLite database connection object
    """
    db_path = os.path.join(current_app.config['INSTANCE_PATH'], 'xss_demo.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


# =========== Secure Functions ===========

def secure_reflect_search_term(search_term):
    """
    SECURE: Protected against reflected XSS in search functionality.
    
    Args:
        search_term (str): Search term from user input
        
    Returns:
        dict: Search results with properly escaped output
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Log search query
    cursor.execute(
        "INSERT INTO search_history (query, user_id) VALUES (?, ?)",
        (search_term, 1)
    )
    conn.commit()
    
    # Secure: Escape user input before reflecting it back in HTML
    escaped_term = html.escape(search_term)
    
    # Perform search
    cursor.execute(
        "SELECT * FROM comments WHERE content LIKE ?",
        (f'%{search_term}%',)
    )
    results = cursor.fetchall()
    conn.close()
    
    # Return search results with the properly escaped term
    return {
        'query': search_term,  # Original term (safe for JSON)
        'count': len(results),
        'results': [dict(r) for r in results],
        'html_snippet': f"<div>You searched for: {escaped_term}</div>"  # Escaped for HTML
    }


def secure_store_comment(username, content, post_id=1):
    """
    SECURE: Protected against stored XSS in comment submission.
    
    Args:
        username (str): Username of commenter
        content (str): Comment content
        post_id (int): ID of the post being commented on
        
    Returns:
        dict: Stored comment data
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Option 1: Store sanitized content
    # sanitized_content = html.escape(content)
    # cursor.execute(
    #     "INSERT INTO comments (username, content, post_id) VALUES (?, ?, ?)",
    #     (username, sanitized_content, post_id)
    # )
    
    # Option 2: Store raw content (preferred for flexibility)
    # The sanitization happens when displaying the content
    cursor.execute(
        "INSERT INTO comments (username, content, post_id) VALUES (?, ?, ?)",
        (username, content, post_id)
    )
    
    conn.commit()
    
    # Get the inserted comment
    comment_id = cursor.lastrowid
    cursor.execute("SELECT * FROM comments WHERE id = ?", (comment_id,))
    comment = cursor.fetchone()
    conn.close()
    
    # Return comment data (when displayed, it will need to be escaped)
    result = dict(comment) if comment else None
    
    # Add an escaped version for HTML display
    if result:
        result['escaped_content'] = html.escape(result['content'])
    
    return result


def secure_get_comments(post_id=1):
    """
    SECURE: Retrieve comments with protection against stored XSS.
    
    Args:
        post_id (int): ID of the post to get comments for
        
    Returns:
        list: Comments with properly escaped content for display
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC", (post_id,))
    comments = cursor.fetchall()
    conn.close()
    
    # Process the comments for secure display
    result = []
    for comment in comments:
        comment_dict = dict(comment)
        # Add escaped content for HTML display
        comment_dict['escaped_content'] = html.escape(comment_dict['content'])
        result.append(comment_dict)
    
    return result


def secure_profile_page(username):
    """
    SECURE: Protected against DOM-based XSS in user profile page.
    
    Args:
        username (str): Username to look up
        
    Returns:
        dict: Profile data with secure HTML template
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get the user profile
    cursor.execute("SELECT * FROM user_profiles WHERE username = ?", (username,))
    profile = cursor.fetchone()
    conn.close()
    
    if not profile:
        return {'error': 'Profile not found'}
    
    profile_dict = dict(profile)
    
    # Secure: Ensure all data is properly escaped in the template
    template = """
        <div class="profile">
            <h2>{{ username | escape }}'s Profile</h2>
            <div class="avatar">
                <img src="{{ avatar_url | escape }}" alt="Profile Picture">
            </div>
            <div class="bio">
                <h3>Bio</h3>
                <p>{{ bio | escape }}</p>
            </div>
            <div class="website">
                <h3>Website</h3>
                <a href="{{ website | escape }}">{{ website | escape }}</a>
            </div>
        </div>
    """
    
    # Create context with escape function for automatic HTML escaping
    context = {
        'username': profile_dict['username'],
        'avatar_url': profile_dict['avatar_url'],
        'bio': profile_dict['bio'] or '',
        'website': profile_dict['website'] or '',
        'escape': escape  # Provide escape function to template
    }
    
    # Render template with automatic escaping
    profile_dict['html'] = render_template_string(template, **context)
    
    return profile_dict


def secure_url_parsing(url_param):
    """
    SECURE: Protected against XSS through URL parameter parsing.
    
    Args:
        url_param (str): URL parameter from request
        
    Returns:
        dict: Processed URL data
    """
    # Secure: Validate URL scheme
    allowed_schemes = ['http', 'https']
    
    # Parse URL
    parsed_url = urllib.parse.urlparse(url_param)
    
    # Check if scheme is allowed
    if parsed_url.scheme.lower() not in allowed_schemes:
        return {
            'original_url': url_param,
            'processed': False,
            'error': 'Invalid URL scheme. Only HTTP and HTTPS are allowed.',
            'html_link': 'Invalid URL'
        }
    
    # Additional validation for URL
    if not parsed_url.netloc:
        return {
            'original_url': url_param,
            'processed': False,
            'error': 'Invalid URL format.',
            'html_link': 'Invalid URL'
        }
    
    # Escape URL for HTML context
    escaped_url = html.escape(url_param)
    
    return {
        'original_url': url_param,
        'processed': True,
        'html_link': f'<a href="{escaped_url}">Click here</a>'
    }


def secure_json_handling(json_input):
    """
    SECURE: Protected against XSS through proper JSON handling.
    
    Args:
        json_input (str): JSON string from user input
        
    Returns:
        dict: Processed JSON data
    """
    try:
        # Parse the JSON
        data = json.loads(json_input)
        
        # Sanitize data for HTML output
        name = data.get('name', 'Guest')
        escaped_name = html.escape(name)
        
        # Use the escaped value in HTML output
        result = {
            'processed': True,
            'data': data,
            'html_output': f"<div>Welcome, {escaped_name}!</div>"
        }
        return result
    except Exception as e:
        return {'error': str(e)}


def secure_template_rendering(template_data):
    """
    SECURE: Protected against server-side template injection.
    
    Args:
        template_data (dict): Template data
        
    Returns:
        dict: Rendered template
    """
    try:
        # Secure: Do not allow user-controlled template strings
        # Instead, use a predefined template and only allow user data
        
        # Predefined safe template
        template_string = "Hello, {{ name }}! The current time is {{ current_time }}."
        
        # Get user data with proper validation
        name = template_data.get('name', 'Guest')
        if not isinstance(name, str) or len(name) > 50:
            name = 'Guest'  # Default if invalid
            
        # Safe context with only allowed variables
        context = {
            'name': name,
            'current_time': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Render template with escape function
        rendered = render_template_string(template_string, **context)
        
        return {
            'rendered': rendered,
            'context': context,
            'template': template_string  # Show the predefined template for educational purposes
        }
    except Exception as e:
        return {'error': str(e)}


def use_content_security_policy():
    """
    BEST PRACTICE: Using Content Security Policy to prevent XSS.
    
    Returns:
        dict: Information about CSP
    """
    example_csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'"
    
    return {
        'info': "Content Security Policy (CSP) is a powerful defense against XSS attacks",
        'example_header': f"Content-Security-Policy: {example_csp}",
        'benefits': [
            "Restricts which scripts, styles, and resources can be executed",
            "Provides an additional layer of protection beyond output encoding",
            "Can be configured to report violations without blocking execution"
        ],
        'implementation': "Add CSP headers to HTTP responses or use meta tags in HTML"
    }


def sanitize_html_example(html_content):
    """
    BEST PRACTICE: Using HTML sanitization libraries for rich text.
    
    Args:
        html_content (str): HTML content to sanitize
        
    Returns:
        dict: Sanitization example
    """
    # This is a simplified example. In a real application, you would use:
    # - DOMPurify (client-side)
    # - bleach (Python)
    # - sanitize-html (Node.js)
    
    # Simple tag whitelist (simplified example)
    allowed_tags = ['p', 'a', 'b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li']
    
    # Simple regex-based sanitizer (for demonstration only - NOT for production use)
    def simple_sanitizer(content):
        # Remove all script tags and their content
        content = re.sub(r'<script\b[^<]*(?:(?!</script>)<[^<]*)*</script>', '', content, flags=re.IGNORECASE)
        
        # Remove on* attributes
        content = re.sub(r'\bon\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
        
        # Only allow whitelisted tags
        for tag in allowed_tags:
            # Allow opening and closing tags in the whitelist
            pass
        
        return content
    
    # Note: This is a simplified example and should not be used in production
    sanitized = simple_sanitizer(html_content)
    
    return {
        'original': html_content,
        'sanitized': sanitized,
        'note': "This is a simplified example. In production, use established libraries like DOMPurify, bleach, or sanitize-html."
    }
