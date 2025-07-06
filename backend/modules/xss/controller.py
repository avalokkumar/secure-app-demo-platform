"""
Controller for the XSS module, providing a unified interface to vulnerable and secure implementations.

This module serves as the main entry point for the XSS (Cross-Site Scripting) demonstration,
coordinating access to both vulnerable and secure implementations.
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from . import vulnerable, secure

# Create blueprint for XSS module
xss_bp = Blueprint('xss', __name__, url_prefix='/api/modules/xss')


@xss_bp.route('/info', methods=['GET'])
def get_module_info():
    """
    Get information about the XSS module.
    
    Returns:
        JSON: Module information
    """
    return jsonify({
        'id': 'xss',
        'name': 'Cross-Site Scripting (XSS)',
        'description': 'Learn about Cross-Site Scripting vulnerabilities and how to prevent them',
        'functions': [
            {
                'id': 'reflected',
                'name': 'Reflected XSS',
                'description': 'Demonstrates reflected XSS vulnerabilities in search forms and URL parameters',
                'type': 'client-side'
            },
            {
                'id': 'stored',
                'name': 'Stored XSS',
                'description': 'Demonstrates stored XSS vulnerabilities in comments and user-generated content',
                'type': 'client-side'
            },
            {
                'id': 'dom-based',
                'name': 'DOM-Based XSS',
                'description': 'Demonstrates DOM-based XSS vulnerabilities through client-side JavaScript',
                'type': 'client-side'
            },
            {
                'id': 'template',
                'name': 'Template Injection',
                'description': 'Demonstrates server-side template injection vulnerabilities',
                'type': 'server-side'
            }
        ]
    })


@xss_bp.route('/setup', methods=['POST'])
@jwt_required()
def setup_database():
    """
    Initialize the demonstration database.
    
    Returns:
        JSON: Setup result
    """
    try:
        vulnerable.setup_demo_db()
        return jsonify({
            'success': True,
            'message': 'XSS demo database initialized successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Error setting up XSS demo DB: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error initializing database: {str(e)}"
        }), 500


@xss_bp.route('/reflected', methods=['GET'])
def reflected_xss_demo():
    """
    XSS demonstration for reflected XSS vulnerabilities.
    
    Returns:
        JSON: Search results with vulnerability demonstration
    """
    search_term = request.args.get('q', '')
    demo_type = request.args.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_reflect_search_term(search_term)
            response_type = "Unescaped user input directly reflected in HTML response"
        else:
            result = secure.secure_reflect_search_term(search_term)
            response_type = "User input properly escaped before insertion into HTML"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'response_type': response_type,
            'result': result,
            'educational_note': """
                Reflected XSS occurs when user input is immediately returned to the browser without proper sanitization.
                This usually happens in search forms, error messages, or URL parameters.
                
                Prevention: Always escape user input when inserting it into HTML contexts using functions like 
                html.escape() in Python or using template engines with automatic escaping.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in XSS reflected demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@xss_bp.route('/stored/comments', methods=['GET'])
def get_comments_demo():
    """
    XSS demonstration for retrieving stored comments with potential XSS payloads.
    
    Returns:
        JSON: Comments with vulnerability demonstration
    """
    demo_type = request.args.get('type', 'vulnerable')
    post_id = request.args.get('post_id', 1)
    
    try:
        post_id = int(post_id)
        
        if demo_type == 'vulnerable':
            comments = vulnerable.vulnerable_get_comments(post_id)
            response_type = "Comments retrieved with unsanitized content"
        else:
            comments = secure.secure_get_comments(post_id)
            response_type = "Comments retrieved with properly escaped content"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'response_type': response_type,
            'comments': comments,
            'educational_note': """
                Stored XSS occurs when malicious content is saved to a database and later served to users.
                This type of XSS is particularly dangerous as it affects every user who views the page.
                
                Prevention:
                1. Sanitize user input before storing it in the database (if appropriate)
                2. Always escape user-generated content when embedding it in HTML
                3. Consider using sanitization libraries for rich text content
            """
        })
    except ValueError:
        return jsonify({'error': 'Invalid post ID'}), 400
    except Exception as e:
        current_app.logger.error(f"Error in XSS stored comments demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@xss_bp.route('/stored/comments', methods=['POST'])
def add_comment_demo():
    """
    XSS demonstration for adding comments with potential XSS payloads.
    
    Returns:
        JSON: Added comment with vulnerability demonstration
    """
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'content', 'type')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    username = data.get('username', '')
    content = data.get('content', '')
    post_id = data.get('post_id', 1)
    demo_type = data.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_store_comment(username, content, post_id)
            response_type = "Comment stored with unsanitized content"
        else:
            result = secure.secure_store_comment(username, content, post_id)
            response_type = "Comment stored safely with escaping when displayed"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'response_type': response_type,
            'comment': result,
            'educational_note': """
                Stored XSS can occur when user input isn't properly sanitized before storage
                and subsequently displayed to users. This allows attackers to embed persistent
                malicious scripts that affect all visitors.
                
                Prevention strategies include:
                1. Input validation
                2. Output encoding
                3. Using Content Security Policy (CSP)
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in XSS add comment demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@xss_bp.route('/dom', methods=['GET'])
def dom_xss_demo():
    """
    XSS demonstration for DOM-based XSS vulnerabilities.
    
    Returns:
        JSON: User profile with vulnerability demonstration
    """
    username = request.args.get('username', 'john_doe')
    demo_type = request.args.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_profile_page(username)
            response_type = "Profile page with unescaped user content in HTML"
        else:
            result = secure.secure_profile_page(username)
            response_type = "Profile page with properly escaped content"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'response_type': response_type,
            'profile': result,
            'educational_note': """
                DOM-based XSS occurs when JavaScript modifies the DOM "unsafely" with user-controlled data.
                This type of XSS can be harder to detect as it happens entirely in the client-side code.
                
                Prevention:
                1. Use safe DOM APIs like textContent instead of innerHTML
                2. Sanitize data before updating the DOM
                3. Implement Content Security Policy (CSP)
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in DOM XSS demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@xss_bp.route('/url', methods=['GET'])
def url_xss_demo():
    """
    XSS demonstration for URL-related XSS vulnerabilities.
    
    Returns:
        JSON: Processed URL with vulnerability demonstration
    """
    url = request.args.get('url', 'https://example.com')
    demo_type = request.args.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_url_parsing(url)
            response_type = "URL used without validation or escaping"
        else:
            result = secure.secure_url_parsing(url)
            response_type = "URL validated and properly escaped"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'response_type': response_type,
            'url_data': result,
            'educational_note': """
                XSS can occur through malicious URLs, especially when using javascript: protocol.
                Always validate URL schemes and escape URLs in HTML contexts.
                
                Prevention:
                1. Whitelist allowed URL schemes (http, https)
                2. Escape URLs when embedding in HTML
                3. Use proper link attributes like rel="noopener noreferrer" for external links
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in URL XSS demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@xss_bp.route('/json', methods=['POST'])
def json_xss_demo():
    """
    XSS demonstration for JSON-related XSS vulnerabilities.
    
    Returns:
        JSON: Processed JSON data with vulnerability demonstration
    """
    data = request.get_json()
    if not data or 'json' not in data:
        return jsonify({'error': 'Missing JSON input'}), 400
    
    json_input = data.get('json', '{}')
    demo_type = data.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_json_handling(json_input)
            response_type = "JSON values used without escaping in HTML context"
        else:
            result = secure.secure_json_handling(json_input)
            response_type = "JSON values properly escaped before HTML insertion"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'response_type': response_type,
            'result': result,
            'educational_note': """
                Even when using JSON APIs, XSS can occur when rendering the received data in HTML.
                Always escape values from JSON when inserting them into HTML contexts.
                
                Prevention:
                1. Treat JSON data as untrusted even if it's from your own API
                2. Escape all values when rendering to HTML
                3. Use JSON.parse() safely with try/catch
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in JSON XSS demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@xss_bp.route('/template', methods=['POST'])
def template_injection_demo():
    """
    Demonstration for server-side template injection (a related vulnerability to XSS).
    
    Returns:
        JSON: Rendered template with vulnerability demonstration
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing template data'}), 400
    
    demo_type = data.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_template_injection(data)
            response_type = "User-controlled template string executed"
        else:
            result = secure.secure_template_rendering(data)
            response_type = "Only predefined templates with escaped values"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'response_type': response_type,
            'result': result,
            'educational_note': """
                Server-Side Template Injection occurs when user input directly influences template execution.
                This can lead to remote code execution in many template engines.
                
                Prevention:
                1. Never allow users to control template code/structure
                2. Only insert user data into predefined templates
                3. Use sandboxed template environments
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in template injection demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@xss_bp.route('/csp-info', methods=['GET'])
def csp_info():
    """
    Get information about Content Security Policy for XSS prevention.
    
    Returns:
        JSON: CSP information
    """
    return jsonify(secure.use_content_security_policy())


def register_module(app):
    """
    Register the XSS module with the Flask application.
    
    Args:
        app: Flask application instance
    """
    app.register_blueprint(xss_bp)
    current_app.logger.info("XSS module registered")
