"""
HTTP Header Analyzer functionality for analyzing HTTP headers for security issues.

This module provides utilities for analyzing HTTP headers to identify security issues
and provide recommendations for improving security posture.
"""
import re
import json
import urllib.parse
from datetime import datetime, timedelta


class HeaderAnalyzer:
    """
    Class for analyzing HTTP headers for security issues.
    """
    
    def __init__(self):
        """Initialize the header analyzer with security header definitions."""
        # Security headers and their definitions
        self.security_headers = {
            'strict-transport-security': {
                'name': 'Strict-Transport-Security',
                'description': 'Forces browsers to use HTTPS for the specified domain',
                'recommended': True,
                'recommended_value': 'max-age=31536000; includeSubDomains; preload',
                'security_impact': 'High',
                'mitigates': ['SSL/TLS downgrade', 'Cookie hijacking'],
                'test_regex': r'max-age=(\d+)',
                'min_age': 15552000  # 180 days in seconds
            },
            'content-security-policy': {
                'name': 'Content-Security-Policy',
                'description': 'Controls which resources can be loaded by the browser',
                'recommended': True,
                'recommended_value': "default-src 'self'; script-src 'self'; object-src 'none';",
                'security_impact': 'High',
                'mitigates': ['XSS', 'Data injection', 'Clickjacking'],
                'test_regex': None  # Too complex for regex checking
            },
            'x-content-type-options': {
                'name': 'X-Content-Type-Options',
                'description': 'Prevents MIME type sniffing',
                'recommended': True,
                'recommended_value': 'nosniff',
                'security_impact': 'Medium',
                'mitigates': ['MIME confusion attacks', 'XSS'],
                'test_regex': r'nosniff'
            },
            'x-frame-options': {
                'name': 'X-Frame-Options',
                'description': 'Prevents clickjacking by controlling whether page can be framed',
                'recommended': True,
                'recommended_value': 'DENY',
                'security_impact': 'Medium',
                'mitigates': ['Clickjacking'],
                'test_regex': r'DENY|SAMEORIGIN'
            },
            'x-xss-protection': {
                'name': 'X-XSS-Protection',
                'description': 'Enables browser\'s built-in XSS filtering',
                'recommended': False,  # Modern browsers use CSP instead
                'recommended_value': '1; mode=block',
                'security_impact': 'Low',
                'mitigates': ['XSS'],
                'test_regex': r'1',
                'notes': 'Deprecated in favor of Content-Security-Policy'
            },
            'referrer-policy': {
                'name': 'Referrer-Policy',
                'description': 'Controls information included in the Referer header',
                'recommended': True,
                'recommended_value': 'strict-origin-when-cross-origin',
                'security_impact': 'Medium',
                'mitigates': ['Information disclosure'],
                'test_regex': None  # Multiple valid options
            },
            'permissions-policy': {
                'name': 'Permissions-Policy',
                'description': 'Controls which browser features can be used',
                'recommended': True,
                'recommended_value': 'geolocation=(), camera=(), microphone=()',
                'security_impact': 'Medium',
                'mitigates': ['Feature policy abuse'],
                'test_regex': None,
                'notes': 'Formerly known as Feature-Policy'
            },
            'cache-control': {
                'name': 'Cache-Control',
                'description': 'Controls how content is cached',
                'recommended': True,
                'recommended_value': 'no-cache, no-store, must-revalidate',
                'security_impact': 'Medium',
                'mitigates': ['Sensitive data exposure'],
                'test_regex': r'no-store'
            },
            'set-cookie': {
                'name': 'Set-Cookie',
                'description': 'Sets cookies with various security attributes',
                'recommended': True,
                'recommended_value': 'Contains secure; httpOnly; samesite=strict',
                'security_impact': 'High',
                'mitigates': ['Cookie theft', 'CSRF', 'Session hijacking'],
                'test_regex': None  # Analyzed separately
            }
        }
        
        # Non-standard or potentially risky headers
        self.risky_headers = {
            'server': {
                'name': 'Server',
                'risk': 'Information disclosure',
                'recommendation': 'Remove or use generic value'
            },
            'x-powered-by': {
                'name': 'X-Powered-By',
                'risk': 'Information disclosure',
                'recommendation': 'Remove'
            },
            'x-aspnet-version': {
                'name': 'X-AspNet-Version',
                'risk': 'Information disclosure',
                'recommendation': 'Remove'
            },
            'x-aspnetmvc-version': {
                'name': 'X-AspNetMvc-Version',
                'risk': 'Information disclosure',
                'recommendation': 'Remove'
            }
        }
    
    def analyze_headers(self, headers):
        """
        Analyze HTTP headers for security issues.
        
        Args:
            headers (dict): HTTP headers to analyze
            
        Returns:
            dict: Analysis results
        """
        # Normalize header names (case-insensitive)
        norm_headers = {k.lower(): v for k, v in headers.items()}
        
        # Results
        results = {
            'score': 0,
            'max_score': 100,
            'timestamp': datetime.utcnow().isoformat(),
            'summary': {},
            'missing_headers': [],
            'implemented_headers': [],
            'risky_headers': [],
            'recommendations': []
        }
        
        # Count security issues
        security_issues = 0
        
        # Check for missing security headers
        for header_id, header_info in self.security_headers.items():
            if header_info['recommended'] and header_id not in norm_headers:
                results['missing_headers'].append({
                    'name': header_info['name'],
                    'description': header_info['description'],
                    'recommended_value': header_info['recommended_value'],
                    'security_impact': header_info['security_impact'],
                    'mitigates': header_info['mitigates']
                })
                security_issues += 1
            elif header_id in norm_headers:
                header_value = norm_headers[header_id]
                header_analysis = {
                    'name': header_info['name'],
                    'value': header_value,
                    'description': header_info['description'],
                    'security_impact': header_info['security_impact'],
                    'issues': []
                }
                
                # Check header value for issues
                if header_info['test_regex'] and not re.search(header_info['test_regex'], header_value):
                    header_analysis['issues'].append(f"Value doesn't match recommended pattern")
                    header_analysis['recommendation'] = f"Consider using: {header_info['recommended_value']}"
                    security_issues += 0.5
                
                # Special case for HSTS max-age
                if header_id == 'strict-transport-security' and 'min_age' in header_info:
                    max_age_match = re.search(r'max-age=(\d+)', header_value)
                    if max_age_match:
                        max_age = int(max_age_match.group(1))
                        if max_age < header_info['min_age']:
                            header_analysis['issues'].append(f"max-age too short: {max_age} seconds")
                            header_analysis['recommendation'] = f"Increase max-age to at least {header_info['min_age']} seconds"
                            security_issues += 0.5
                    
                    # Check for includeSubDomains
                    if 'includeSubDomains' not in header_value:
                        header_analysis['issues'].append("Missing 'includeSubDomains' directive")
                        header_analysis['recommendation'] = "Add 'includeSubDomains' directive to protect subdomains"
                        security_issues += 0.5
                
                # Special case for Content-Security-Policy
                if header_id == 'content-security-policy':
                    if "'unsafe-inline'" in header_value or "'unsafe-eval'" in header_value:
                        header_analysis['issues'].append("Contains unsafe directives: 'unsafe-inline' or 'unsafe-eval'")
                        header_analysis['recommendation'] = "Remove unsafe directives and use nonces or hashes instead"
                        security_issues += 0.5
                
                # Special case for Cookie security
                if header_id == 'set-cookie':
                    # Multiple cookies might be set with separate headers
                    cookies = [header_value] if isinstance(header_value, str) else header_value
                    cookie_issues = []
                    
                    for cookie in cookies:
                        if 'secure' not in cookie.lower():
                            cookie_issues.append("Missing 'Secure' attribute")
                        if 'httponly' not in cookie.lower():
                            cookie_issues.append("Missing 'HttpOnly' attribute")
                        if not re.search(r'samesite=(strict|lax)', cookie.lower()):
                            cookie_issues.append("Missing or weak 'SameSite' attribute")
                    
                    if cookie_issues:
                        header_analysis['issues'].extend(cookie_issues)
                        header_analysis['recommendation'] = "Add missing security attributes to cookies"
                        security_issues += 1
                
                results['implemented_headers'].append(header_analysis)
        
        # Check for risky headers
        for header_id, header_info in self.risky_headers.items():
            if header_id in norm_headers:
                results['risky_headers'].append({
                    'name': header_info['name'],
                    'value': norm_headers[header_id],
                    'risk': header_info['risk'],
                    'recommendation': header_info['recommendation']
                })
                security_issues += 0.5
        
        # Calculate security score (100 - deductions)
        max_deduction = 100 - (100 / (len(self.security_headers) + len(self.risky_headers) * 0.5))
        if security_issues == 0:
            results['score'] = 100
        else:
            results['score'] = max(0, 100 - (security_issues / (len(self.security_headers) + len(self.risky_headers) * 0.5)) * max_deduction)
        
        # Round score to 2 decimal places
        results['score'] = round(results['score'], 2)
        
        # Generate summary
        results['summary'] = {
            'total_headers': len(headers),
            'implemented_security_headers': len(results['implemented_headers']),
            'missing_security_headers': len(results['missing_headers']),
            'risky_headers': len(results['risky_headers']),
            'security_score': results['score']
        }
        
        # Generate recommendations
        if results['missing_headers']:
            results['recommendations'].append({
                'priority': 'High',
                'title': 'Implement Missing Security Headers',
                'description': 'Add the missing security headers to improve your security posture',
                'headers': [h['name'] for h in results['missing_headers']]
            })
        
        for header in results['implemented_headers']:
            if 'issues' in header and header['issues']:
                results['recommendations'].append({
                    'priority': 'Medium',
                    'title': f"Fix Issues with {header['name']} Header",
                    'description': header.get('recommendation', 'Fix identified issues with this header'),
                    'issues': header['issues']
                })
        
        if results['risky_headers']:
            results['recommendations'].append({
                'priority': 'Medium',
                'title': 'Remove or Modify Risky Headers',
                'description': 'Remove or modify headers that disclose sensitive information',
                'headers': [h['name'] for h in results['risky_headers']]
            })
        
        return results
    
    def analyze_url(self, url):
        """
        Analyze security implications of a URL.
        
        Args:
            url (str): URL to analyze
            
        Returns:
            dict: Analysis results
        """
        # Parse URL
        parsed_url = urllib.parse.urlparse(url)
        
        results = {
            'url': url,
            'scheme': parsed_url.scheme,
            'domain': parsed_url.netloc,
            'path': parsed_url.path,
            'query': parsed_url.query,
            'issues': [],
            'recommendations': []
        }
        
        # Check for HTTPS
        if parsed_url.scheme != 'https':
            results['issues'].append({
                'severity': 'High',
                'issue': 'Non-HTTPS URL',
                'description': 'URL uses insecure HTTP protocol instead of HTTPS'
            })
            results['recommendations'].append('Switch to HTTPS to encrypt data in transit')
        
        # Check for suspicious domains or subdomains
        suspicious_domains = ['example', 'test', 'dev', 'staging', 'localhost']
        for domain in suspicious_domains:
            if domain in parsed_url.netloc:
                results['issues'].append({
                    'severity': 'Medium',
                    'issue': 'Suspicious domain or subdomain',
                    'description': f"URL contains potentially non-production domain: '{domain}'"
                })
                results['recommendations'].append('Verify this is the intended production domain')
                break
        
        # Check for sensitive information in query string
        sensitive_params = ['password', 'pass', 'passwd', 'pwd', 'secret', 'token', 'api_key', 'apikey', 'access_token', 'auth']
        query_params = urllib.parse.parse_qs(parsed_url.query)
        
        for param in sensitive_params:
            if param in query_params:
                results['issues'].append({
                    'severity': 'High',
                    'issue': 'Sensitive information in URL',
                    'description': f"URL contains potentially sensitive parameter: '{param}'"
                })
                results['recommendations'].append('Move sensitive data to request body or headers')
        
        # Check for excessive query parameters (potential for data leakage)
        if len(query_params) > 10:
            results['issues'].append({
                'severity': 'Low',
                'issue': 'Excessive query parameters',
                'description': f"URL contains {len(query_params)} query parameters"
            })
            results['recommendations'].append('Consider reducing the number of query parameters')
        
        return results


def analyze_headers(headers):
    """
    Analyze HTTP headers for security issues.
    
    Args:
        headers (dict): HTTP headers to analyze
        
    Returns:
        dict: Analysis results
    """
    analyzer = HeaderAnalyzer()
    return analyzer.analyze_headers(headers)


def analyze_url(url):
    """
    Analyze security implications of a URL.
    
    Args:
        url (str): URL to analyze
        
    Returns:
        dict: Analysis results
    """
    analyzer = HeaderAnalyzer()
    return analyzer.analyze_url(url)
