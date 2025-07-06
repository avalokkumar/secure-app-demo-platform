"""
Controller for the SQL injection module, providing a unified interface to vulnerable and secure implementations.

This module serves as the main entry point for the SQL injection demonstration,
coordinating access to both vulnerable and secure implementations.
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from . import vulnerable, secure

# Create blueprint for SQL injection module
sql_injection_bp = Blueprint('sql_injection', __name__, url_prefix='/api/modules/sql-injection')


@sql_injection_bp.route('/info', methods=['GET'])
def get_module_info():
    """
    Get information about the SQL injection module.
    
    Returns:
        JSON: Module information
    """
    return jsonify({
        'id': 'sql-injection',
        'name': 'SQL Injection',
        'description': 'Learn about SQL injection vulnerabilities and how to prevent them',
        'functions': [
            {
                'id': 'login',
                'name': 'Authentication Bypass',
                'description': 'Demonstrates SQL injection in login forms',
                'type': 'authentication'
            },
            {
                'id': 'search',
                'name': 'Data Extraction',
                'description': 'Demonstrates SQL injection in search functions',
                'type': 'data-leak'
            },
            {
                'id': 'profile',
                'name': 'Data Modification',
                'description': 'Demonstrates SQL injection in update operations',
                'type': 'data-modification'
            },
            {
                'id': 'dynamic',
                'name': 'Dynamic Queries',
                'description': 'Demonstrates SQL injection in dynamic table/column queries',
                'type': 'advanced'
            },
            {
                'id': 'blind',
                'name': 'Blind SQL Injection',
                'description': 'Demonstrates blind SQL injection techniques',
                'type': 'advanced'
            }
        ]
    })


@sql_injection_bp.route('/setup', methods=['POST'])
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
            'message': 'SQL injection demo database initialized successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Error setting up SQL injection demo DB: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error initializing database: {str(e)}"
        }), 500


@sql_injection_bp.route('/login', methods=['POST'])
def login_demo():
    """
    SQL injection demonstration for login functionality.
    
    Returns:
        JSON: Login result with vulnerability demonstration
    """
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'password', 'type')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    username = data.get('username', '')
    password = data.get('password', '')
    demo_type = data.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_login(username, password)
            query_info = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        else:
            result = secure.secure_login(username, password)
            query_info = "SELECT * FROM users WHERE username = ? AND password = ?"
            
        # Remove password from result if it exists
        if isinstance(result, dict) and 'password' in result:
            del result['password']
            
        return jsonify({
            'success': bool(result),
            'type': demo_type,
            'user': result,
            'query_info': query_info,
            'educational_note': """
                SQL injection in login forms can allow attackers to bypass authentication by manipulating
                the query logic. The classic example is using ' OR 1=1 -- to make the WHERE clause always true.
                
                Prevention: Always use parameterized queries or prepared statements with placeholders.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in SQL injection login demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@sql_injection_bp.route('/search', methods=['GET'])
def search_demo():
    """
    SQL injection demonstration for search functionality.
    
    Returns:
        JSON: Search results with vulnerability demonstration
    """
    search_term = request.args.get('term', '')
    demo_type = request.args.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            results = vulnerable.vulnerable_search_products(search_term)
            query_info = f"SELECT * FROM products WHERE name LIKE '%{search_term}%' OR description LIKE '%{search_term}%'"
        else:
            results = secure.secure_search_products(search_term)
            query_info = "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'results': results,
            'query_info': query_info,
            'educational_note': """
                SQL injection in search functions can allow attackers to extract data from other tables
                using UNION attacks. Attackers can also use this to obtain schema information.
                
                Prevention: Use parameterized queries and validate input before using it in SQL queries.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in SQL injection search demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@sql_injection_bp.route('/user/<user_id>', methods=['GET'])
def get_user_demo(user_id):
    """
    SQL injection demonstration for retrieving user data.
    
    Returns:
        JSON: User data with vulnerability demonstration
    """
    demo_type = request.args.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            result = vulnerable.vulnerable_get_user_by_id(user_id)
            query_info = f"SELECT id, username, email, is_admin FROM users WHERE id = {user_id}"
        else:
            result = secure.secure_get_user_by_id(user_id)
            query_info = "SELECT id, username, email, is_admin FROM users WHERE id = ?"
            
        return jsonify({
            'success': bool(result),
            'type': demo_type,
            'user': result,
            'query_info': query_info,
            'educational_note': """
                SQL injection in user lookup functions can allow attackers to retrieve data for all users
                when they should only be able to access their own information.
                
                Prevention: Use parameterized queries and proper type validation for IDs.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in SQL injection get user demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@sql_injection_bp.route('/profile/<user_id>', methods=['PUT'])
def update_profile_demo(user_id):
    """
    SQL injection demonstration for updating user profile.
    
    Returns:
        JSON: Update result with vulnerability demonstration
    """
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data.get('email', '')
    demo_type = data.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            success = vulnerable.vulnerable_update_profile(user_id, email)
            query_info = f"UPDATE users SET email = '{email}' WHERE id = {user_id}"
        else:
            success = secure.secure_update_profile(user_id, email)
            query_info = "UPDATE users SET email = ? WHERE id = ?"
            
        return jsonify({
            'success': success,
            'type': demo_type,
            'query_info': query_info,
            'educational_note': """
                SQL injection in update operations can allow attackers to modify data they shouldn't have access to,
                including elevating privileges by setting admin flags or changing other users' data.
                
                Prevention: Use parameterized queries and validate input before using it in SQL queries.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in SQL injection update profile demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@sql_injection_bp.route('/dynamic', methods=['GET'])
def dynamic_query_demo():
    """
    SQL injection demonstration for dynamic queries with table/column parameters.
    
    Returns:
        JSON: Query results with vulnerability demonstration
    """
    table = request.args.get('table', 'products')
    column = request.args.get('column', 'name')
    value = request.args.get('value', '')
    demo_type = request.args.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            results = vulnerable.vulnerable_dynamic_query(table, column, value)
            query_info = f"SELECT * FROM {table} WHERE {column} = '{value}'"
        else:
            results = secure.secure_dynamic_query(table, column, value)
            query_info = "SELECT * FROM [validated_table] WHERE [validated_column] = ?"
            
        return jsonify({
            'success': 'error' not in results if isinstance(results, dict) else True,
            'type': demo_type,
            'results': results,
            'query_info': query_info,
            'educational_note': """
                SQL injection in dynamic queries (where table or column names are dynamic) is particularly
                dangerous, as parameterized queries don't protect against injection in table/column identifiers.
                
                Prevention: Whitelist validation for table and column names, or use an ORM that handles this safely.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in SQL injection dynamic query demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@sql_injection_bp.route('/blind', methods=['GET'])
def blind_sql_injection_demo():
    """
    SQL injection demonstration for blind SQL injection techniques.
    
    Returns:
        JSON: Result with vulnerability demonstration
    """
    username = request.args.get('username', '')
    demo_type = request.args.get('type', 'vulnerable')
    
    try:
        if demo_type == 'vulnerable':
            exists = vulnerable.blind_vulnerable_check_user_exists(username)
            query_info = f"SELECT COUNT(*) FROM users WHERE username = '{username}'"
        else:
            exists = secure.secure_check_user_exists(username)
            query_info = "SELECT COUNT(*) FROM users WHERE username = ?"
            
        return jsonify({
            'success': True,
            'type': demo_type,
            'exists': exists,
            'query_info': query_info,
            'educational_note': """
                Blind SQL injection occurs when an application is vulnerable but doesn't display
                the results of the SQL query directly. Attackers can still extract data by using
                boolean conditions and observing differences in application behavior.
                
                Prevention: Use parameterized queries and validate all input.
            """
        })
    except Exception as e:
        current_app.logger.error(f"Error in SQL injection blind demo: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def register_module(app):
    """
    Register the SQL injection module with the Flask application.
    
    Args:
        app: Flask application instance
    """
    app.register_blueprint(sql_injection_bp)
    current_app.logger.info("SQL Injection module registered")
