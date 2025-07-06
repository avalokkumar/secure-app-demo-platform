"""
Controller for the CSRF module, providing a unified interface to vulnerable and secure implementations.

This module serves as the main entry point for the CSRF (Cross-Site Request Forgery) demonstration,
coordinating access to both vulnerable and secure implementations.
"""
from flask import Blueprint, request, jsonify, current_app, session
from flask_jwt_extended import jwt_required, get_jwt_identity

from . import vulnerable, secure

# Create blueprint for CSRF module
csrf_bp = Blueprint('csrf', __name__, url_prefix='/api/modules/csrf')


@csrf_bp.route('/info', methods=['GET'])
def get_module_info():
    """
    Get information about the CSRF module.
    
    Returns:
        JSON: Module information
    """
    return jsonify({
        'id': 'csrf',
        'name': 'Cross-Site Request Forgery (CSRF)',
        'description': 'Learn about Cross-Site Request Forgery vulnerabilities and how to prevent them',
        'functions': [
            {
                'id': 'transfer',
                'name': 'Fund Transfer',
                'description': 'Demonstrates CSRF in financial transactions',
                'type': 'state-changing'
            },
            {
                'id': 'email',
                'name': 'Email Update',
                'description': 'Demonstrates CSRF in account settings changes',
                'type': 'state-changing'
            },
            {
                'id': '2fa',
                'name': 'Two-Factor Authentication',
                'description': 'Demonstrates CSRF in security settings',
                'type': 'security'
            }
        ]
    })


@csrf_bp.route('/setup', methods=['POST'])
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
            'message': 'CSRF demo database initialized successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Error setting up CSRF demo DB: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error initializing database: {str(e)}"
        }), 500


@csrf_bp.route('/token', methods=['GET'])
def get_csrf_token():
    """
    Get a CSRF token for secure demonstrations.
    
    Returns:
        JSON: CSRF token
    """
    token = secure.generate_csrf_token()
    return jsonify({
        'csrf_token': token
    })


@csrf_bp.route('/vulnerable/transfer', methods=['POST'])
def vulnerable_transfer():
    """
    CSRF demonstration for vulnerable fund transfer.
    
    Returns:
        JSON: Transfer result with vulnerability demonstration
    """
    try:
        from_user_id = request.form.get('from_user_id') or request.json.get('from_user_id')
        to_user_id = request.form.get('to_user_id') or request.json.get('to_user_id')
        amount = request.form.get('amount') or request.json.get('amount')
        
        if not all([from_user_id, to_user_id, amount]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = vulnerable.vulnerable_transfer_funds(from_user_id, to_user_id, amount)
        
        return jsonify({
            'success': result.get('success', False),
            'result': result,
            'csrf_protection': False,
            'educational_note': """
                This endpoint is vulnerable to CSRF attacks because it:
                1. Does not validate the origin of the request
                2. Does not require a CSRF token
                3. Accepts form-encoded data that can be submitted from any website
                
                An attacker could create a form on their website that submits to this endpoint,
                and if a user is authenticated on your site, the request would be processed
                with their credentials.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable transfer: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@csrf_bp.route('/secure/transfer', methods=['POST'])
def secure_transfer():
    """
    CSRF demonstration for secure fund transfer.
    
    Returns:
        JSON: Transfer result with CSRF protection
    """
    try:
        from_user_id = request.form.get('from_user_id') or request.json.get('from_user_id')
        to_user_id = request.form.get('to_user_id') or request.json.get('to_user_id')
        amount = request.form.get('amount') or request.json.get('amount')
        csrf_token = request.form.get('csrf_token') or request.json.get('csrf_token') or request.headers.get('X-CSRF-Token')
        
        if not all([from_user_id, to_user_id, amount, csrf_token]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = secure.secure_transfer_funds(from_user_id, to_user_id, amount, csrf_token)
        
        return jsonify({
            'success': result.get('success', False),
            'result': result,
            'csrf_protection': True,
            'educational_note': """
                This endpoint is protected against CSRF attacks by:
                1. Requiring a valid CSRF token that matches the one stored in the user's session
                2. Validating the token using a secure comparison method
                3. Providing a new token for subsequent requests
                
                This synchronizer token pattern ensures that only requests originating
                from your own website with a valid token are processed.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in secure transfer: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@csrf_bp.route('/vulnerable/update-email', methods=['GET', 'POST'])
def vulnerable_email_update():
    """
    CSRF demonstration for vulnerable email update.
    
    Returns:
        JSON: Update result with vulnerability demonstration
    """
    try:
        # Support both GET and POST for demonstration purposes
        user_id = request.values.get('user_id')
        new_email = request.values.get('new_email')
        
        if not all([user_id, new_email]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = vulnerable.vulnerable_update_email(user_id, new_email)
        
        return jsonify({
            'success': result.get('success', False),
            'result': result,
            'csrf_protection': False,
            'educational_note': """
                This endpoint is vulnerable to CSRF attacks because it:
                1. Accepts GET requests that can be triggered via <img> tags or other resources
                2. Does not validate the origin of the request
                3. Does not require a CSRF token
                
                GET-based endpoints that change state are particularly vulnerable because
                they can be exploited even without forms, using resource loading tags.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable email update: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@csrf_bp.route('/secure/update-email', methods=['POST'])
def secure_email_update():
    """
    CSRF demonstration for secure email update.
    
    Returns:
        JSON: Update result with CSRF protection
    """
    try:
        user_id = request.form.get('user_id') or request.json.get('user_id')
        new_email = request.form.get('new_email') or request.json.get('new_email')
        csrf_token = request.form.get('csrf_token') or request.json.get('csrf_token') or request.headers.get('X-CSRF-Token')
        
        if not all([user_id, new_email, csrf_token]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = secure.secure_update_email(user_id, new_email, csrf_token)
        
        return jsonify({
            'success': result.get('success', False),
            'result': result,
            'csrf_protection': True,
            'educational_note': """
                This endpoint is protected against CSRF attacks by:
                1. Only accepting POST requests (not GET)
                2. Requiring a valid CSRF token
                3. Using a proper token validation method
                
                By enforcing POST requests, simple resource-based attacks using <img> tags are prevented.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in secure email update: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@csrf_bp.route('/vulnerable/toggle-2fa', methods=['POST'])
def vulnerable_toggle_2fa():
    """
    CSRF demonstration for vulnerable security settings update.
    
    Returns:
        JSON: Update result with vulnerability demonstration
    """
    try:
        user_id = request.form.get('user_id') or request.json.get('user_id')
        enabled = request.form.get('enabled') or request.json.get('enabled')
        
        if not all([user_id, enabled is not None]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Convert enabled to boolean if it's a string
        if isinstance(enabled, str):
            enabled = enabled.lower() in ('true', 'yes', '1', 'y')
        
        result = vulnerable.vulnerable_toggle_2fa(user_id, enabled)
        
        return jsonify({
            'success': result.get('success', False),
            'result': result,
            'csrf_protection': False,
            'educational_note': """
                This endpoint is vulnerable to CSRF attacks because it:
                1. Does not validate the origin of the request
                2. Does not require a CSRF token
                3. Makes security-critical changes without additional verification
                
                Security settings are high-value targets for CSRF attacks because
                compromising them can lead to account takeover or reduced security.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in vulnerable toggle 2FA: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@csrf_bp.route('/secure/toggle-2fa', methods=['POST'])
def secure_toggle_2fa():
    """
    CSRF demonstration for secure security settings update.
    
    Returns:
        JSON: Update result with CSRF protection
    """
    try:
        user_id = request.form.get('user_id') or request.json.get('user_id')
        enabled = request.form.get('enabled') or request.json.get('enabled')
        csrf_token = request.form.get('csrf_token') or request.json.get('csrf_token') or request.headers.get('X-CSRF-Token')
        
        if not all([user_id, enabled is not None, csrf_token]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Convert enabled to boolean if it's a string
        if isinstance(enabled, str):
            enabled = enabled.lower() in ('true', 'yes', '1', 'y')
        
        result = secure.secure_toggle_2fa(user_id, enabled, csrf_token)
        
        return jsonify({
            'success': result.get('success', False),
            'result': result,
            'csrf_protection': True,
            'educational_note': """
                This endpoint is protected against CSRF attacks and implements additional
                security best practices:
                1. CSRF token validation
                2. POST-only for state changes
                3. Strict type checking for boolean values
                
                For security-critical operations like 2FA changes, consider adding
                additional verification like password re-entry or email confirmation.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in secure toggle 2FA: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@csrf_bp.route('/generate-vulnerable-form', methods=['GET'])
def generate_vulnerable_form_demo():
    """
    Generate a sample vulnerable form for CSRF demonstration.
    
    Returns:
        HTML: Vulnerable form
    """
    form_type = request.args.get('type', 'transfer')
    user_id = request.args.get('user_id', '1')
    
    if form_type == 'transfer':
        action_url = f"{request.host_url}api/modules/csrf/vulnerable/transfer"
        form_fields = {
            'from_user_id': user_id,
            'to_user_id': '4',  # Mallory's ID
            'amount': '500'
        }
        html = vulnerable.generate_vulnerable_form(action_url, form_fields, 'POST')
    elif form_type == 'email':
        action_url = f"{request.host_url}api/modules/csrf/vulnerable/update-email"
        form_fields = {
            'user_id': user_id,
            'new_email': 'hacked@attacker.com'
        }
        html = vulnerable.generate_vulnerable_form(action_url, form_fields, 'POST')
    elif form_type == '2fa':
        action_url = f"{request.host_url}api/modules/csrf/vulnerable/toggle-2fa"
        form_fields = {
            'user_id': user_id,
            'enabled': 'false'
        }
        html = vulnerable.generate_vulnerable_form(action_url, form_fields, 'POST')
    else:
        return jsonify({'error': 'Invalid form type'}), 400
    
    # Return as HTML
    return html, 200, {'Content-Type': 'text/html'}


@csrf_bp.route('/generate-secure-form', methods=['GET'])
def generate_secure_form_demo():
    """
    Generate a sample secure form for CSRF demonstration.
    
    Returns:
        HTML: Secure form with CSRF protection
    """
    form_type = request.args.get('type', 'transfer')
    user_id = request.args.get('user_id', '1')
    
    if form_type == 'transfer':
        action_url = f"{request.host_url}api/modules/csrf/secure/transfer"
        form_fields = {
            'from_user_id': user_id,
            'to_user_id': '2',
            'amount': '100'
        }
        html = secure.generate_secure_form(action_url, form_fields, 'POST')
    elif form_type == 'email':
        action_url = f"{request.host_url}api/modules/csrf/secure/update-email"
        form_fields = {
            'user_id': user_id,
            'new_email': 'newemail@example.com'
        }
        html = secure.generate_secure_form(action_url, form_fields, 'POST')
    elif form_type == '2fa':
        action_url = f"{request.host_url}api/modules/csrf/secure/toggle-2fa"
        form_fields = {
            'user_id': user_id,
            'enabled': 'true'
        }
        html = secure.generate_secure_form(action_url, form_fields, 'POST')
    else:
        return jsonify({'error': 'Invalid form type'}), 400
    
    # Return as HTML
    return html, 200, {'Content-Type': 'text/html'}


@csrf_bp.route('/get-demonstration', methods=['GET'])
def get_csrf_demonstration():
    """
    Get a demonstration of GET-based CSRF attack.
    
    Returns:
        JSON: Demonstration data
    """
    user_id = request.args.get('user_id', '1')
    return jsonify(vulnerable.vulnerable_get_demonstration(user_id))


@csrf_bp.route('/protective-measures', methods=['GET'])
def protective_measures():
    """
    Get information about different CSRF protection techniques.
    
    Returns:
        JSON: Protection techniques
    """
    return jsonify({
        'synchronizer_token': {
            'description': 'Generate and validate unique tokens for each session',
            'effectiveness': 'High',
            'implementation_complexity': 'Medium',
            'example': 'form.hidden_input(name="csrf_token", value=generate_token())'
        },
        'same_site_cookies': secure.use_samesite_cookies(),
        'custom_headers': secure.use_custom_request_headers(),
        'double_submit_cookie': {
            'description': 'Store CSRF token in both a cookie and request parameter',
            'effectiveness': 'High',
            'implementation_complexity': 'Medium',
            'notes': 'Protects even in absence of session state on the server'
        },
        'referer_validation': {
            'description': 'Validate the Referer header against expected origins',
            'effectiveness': 'Medium',
            'implementation_complexity': 'Low',
            'notes': 'Can be spoofed in some cases, should not be the only protection'
        }
    })


def register_module(app):
    """
    Register the CSRF module with the Flask application.
    
    Args:
        app: Flask application instance
    """
    app.register_blueprint(csrf_bp)
    current_app.logger.info("CSRF module registered")
