"""
Controller for the HTTP Header Analyzer module, providing API endpoints for header analysis.

This module serves as the main entry point for the HTTP Header Analyzer, allowing users
to analyze HTTP headers and URLs for security issues.
"""
import re
import json
import urllib.request
from urllib.parse import urlparse
import ssl
from flask import Blueprint, request, jsonify, current_app

from . import analyzer

# Create blueprint for HTTP Header Analyzer module
http_headers_bp = Blueprint('http_headers', __name__, url_prefix='/api/modules/http-headers')


@http_headers_bp.route('/info', methods=['GET'])
def get_module_info():
    """
    Get information about the HTTP Header Analyzer module.
    
    Returns:
        JSON: Module information
    """
    return jsonify({
        'id': 'http-headers',
        'name': 'HTTP Header Analyzer',
        'description': 'Analyze HTTP headers and URLs for security issues',
        'features': [
            {
                'id': 'analyze-headers',
                'name': 'Header Analysis',
                'description': 'Analyze HTTP headers for security issues',
                'type': 'analysis'
            },
            {
                'id': 'fetch-headers',
                'name': 'Fetch Headers',
                'description': 'Fetch HTTP headers from a URL',
                'type': 'utility'
            },
            {
                'id': 'analyze-url',
                'name': 'URL Analysis',
                'description': 'Analyze URLs for security issues',
                'type': 'analysis'
            },
            {
                'id': 'security-headers',
                'name': 'Security Headers',
                'description': 'Get information about security headers',
                'type': 'education'
            }
        ]
    })


@http_headers_bp.route('/analyze-headers', methods=['POST'])
def analyze_headers_endpoint():
    """
    Analyze HTTP headers for security issues.
    
    Returns:
        JSON: Analysis results
    """
    try:
        data = request.get_json()
        if not data or 'headers' not in data:
            return jsonify({'error': 'Missing required field: headers'}), 400
        
        headers = data['headers']
        if not isinstance(headers, dict):
            return jsonify({'error': 'Headers must be provided as a dictionary'}), 400
        
        analysis = analyzer.analyze_headers(headers)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    except Exception as e:
        current_app.logger.error(f"Error analyzing headers: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@http_headers_bp.route('/fetch-headers', methods=['POST'])
def fetch_headers_endpoint():
    """
    Fetch HTTP headers from a URL.
    
    Returns:
        JSON: HTTP headers and analysis
    """
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'Missing required field: url'}), 400
        
        url = data['url']
        
        # Validate URL
        if not url.startswith('http://') and not url.startswith('https://'):
            return jsonify({'error': 'URL must start with http:// or https://'}), 400
        
        try:
            # Create context for SSL verification
            ctx = ssl.create_default_context()
            
            # Allow self-signed certificates if specified
            if data.get('allow_insecure', False):
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
            
            # Create request with custom headers for a more realistic fetch
            req = urllib.request.Request(
                url,
                headers={
                    'User-Agent': 'SADP-HeaderAnalyzer/1.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'close',
                }
            )
            
            # Fetch headers
            with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                fetched_headers = dict(response.getheaders())
                status_code = response.status
        except urllib.error.URLError as e:
            return jsonify({
                'success': False,
                'error': f"Failed to fetch URL: {str(e)}"
            }), 400
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f"Error fetching headers: {str(e)}"
            }), 500
        
        # Analyze the fetched headers
        analysis = analyzer.analyze_headers(fetched_headers)
        
        return jsonify({
            'success': True,
            'url': url,
            'status_code': status_code,
            'headers': fetched_headers,
            'analysis': analysis
        })
    except Exception as e:
        current_app.logger.error(f"Error in fetch headers endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@http_headers_bp.route('/analyze-url', methods=['POST'])
def analyze_url_endpoint():
    """
    Analyze a URL for security issues.
    
    Returns:
        JSON: Analysis results
    """
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'Missing required field: url'}), 400
        
        url = data['url']
        
        # Ensure URL has a scheme
        if not url.startswith('http://') and not url.startswith('https://'):
            url = 'https://' + url
        
        analysis = analyzer.analyze_url(url)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    except Exception as e:
        current_app.logger.error(f"Error analyzing URL: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@http_headers_bp.route('/security-headers', methods=['GET'])
def security_headers_info():
    """
    Get information about security headers.
    
    Returns:
        JSON: Security header information
    """
    header_analyzer = analyzer.HeaderAnalyzer()
    
    # Return information about security headers
    return jsonify({
        'success': True,
        'security_headers': header_analyzer.security_headers,
        'risky_headers': header_analyzer.risky_headers,
        'educational_note': """
            Security headers are a way to enhance the security of a web application by instructing the browser
            how to behave when handling the site's content. Some key security headers include:
            
            1. Strict-Transport-Security (HSTS): Forces browsers to use HTTPS
            2. Content-Security-Policy (CSP): Controls which resources can be loaded
            3. X-Content-Type-Options: Prevents MIME type sniffing
            4. X-Frame-Options: Protects against clickjacking
            5. Referrer-Policy: Controls information in the Referer header
            
            Implementing these headers is a simple yet effective way to improve web security.
        """
    })


@http_headers_bp.route('/examples', methods=['GET'])
def header_examples():
    """
    Get examples of good and bad HTTP headers.
    
    Returns:
        JSON: Header examples
    """
    # Good header examples
    good_headers = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none';",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Set-Cookie': 'sessionId=abc123; Secure; HttpOnly; SameSite=Strict; Path=/'
    }
    
    # Bad header examples
    bad_headers = {
        'Server': 'Apache/2.4.1',
        'X-Powered-By': 'PHP/7.2.1',
        'X-AspNet-Version': '4.0.30319',
        'Set-Cookie': 'sessionId=abc123; Path=/',  # Missing Secure, HttpOnly, SameSite
        'Cache-Control': 'public, max-age=86400'   # Allows caching of potentially sensitive content
    }
    
    return jsonify({
        'success': True,
        'good_headers': good_headers,
        'bad_headers': bad_headers,
        'analysis_good': analyzer.analyze_headers(good_headers),
        'analysis_bad': analyzer.analyze_headers(bad_headers),
        'educational_note': """
            The examples above demonstrate the difference between properly configured 
            security headers and headers with security issues. The 'good_headers' example 
            would receive a high security score, while the 'bad_headers' example would 
            identify multiple issues including information disclosure and missing security features.
        """
    })


def register_module(app):
    """
    Register the HTTP Header Analyzer module with the Flask application.
    
    Args:
        app: Flask application instance
    """
    app.register_blueprint(http_headers_bp)
    current_app.logger.info("HTTP Header Analyzer module registered")
