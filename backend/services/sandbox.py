"""
Sandbox service for safely executing potentially vulnerable code.
"""
import os
import time
import json
import subprocess
import tempfile
import logging
from typing import Dict, Any, Optional

from flask import current_app

# Set up logging
logger = logging.getLogger(__name__)


def execute_in_sandbox(code: str, sandbox_config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Execute code in a secure, isolated sandbox environment.
    
    Args:
        code: The code to execute
        sandbox_config: Configuration for the sandbox environment
        
    Returns:
        dict: Results of the execution including success status, output, and feedback
    """
    # Default configuration
    default_config = {
        'timeout': 30,  # Maximum execution time in seconds
        'memory_limit': 128,  # Maximum memory usage in MB
        'enable_network': False,  # Whether network access is allowed
        'language': 'python',  # Programming language
        'validation_criteria': None  # Optional criteria for automatic validation
    }
    
    # Merge with provided config
    config = {**default_config, **(sandbox_config or {})}
    
    # Create a temporary file to store the code
    with tempfile.NamedTemporaryFile(suffix=f'.{config["language"]}', delete=False) as temp:
        temp_path = temp.name
        temp.write(code.encode('utf-8'))
    
    try:
        # Start time measurement
        start_time = time.time()
        
        # Execute code in sandbox environment (Docker container)
        if config['language'] == 'python':
            # Use Docker to run Python code in sandbox
            cmd = [
                'docker', 'run',
                '--rm',  # Remove container after execution
                '--network', 'none' if not config['enable_network'] else 'bridge',  # Network isolation
                '-m', f'{config["memory_limit"]}m',  # Memory limit
                '-v', f'{temp_path}:/code/script.py',  # Mount the script
                '-w', '/code',  # Working directory
                '--ulimit', 'cpu=30',  # CPU usage limit
                '--ulimit', f'fsize={1024 * 1024}',  # File size limit (1MB)
                'python:3.9-slim',  # Use Python image
                'timeout', str(config['timeout']), 'python', '-u', 'script.py'  # Run with timeout
            ]
        elif config['language'] == 'javascript':
            # Use Docker to run JavaScript code in sandbox
            cmd = [
                'docker', 'run',
                '--rm',  # Remove container after execution
                '--network', 'none' if not config['enable_network'] else 'bridge',  # Network isolation
                '-m', f'{config["memory_limit"]}m',  # Memory limit
                '-v', f'{temp_path}:/code/script.js',  # Mount the script
                '-w', '/code',  # Working directory
                '--ulimit', 'cpu=30',  # CPU usage limit
                '--ulimit', f'fsize={1024 * 1024}',  # File size limit (1MB)
                'node:16-alpine',  # Use Node.js image
                'timeout', str(config['timeout']), 'node', 'script.js'  # Run with timeout
            ]
        elif config['language'] == 'c':
            # For C code, we need to compile then run
            compile_cmd = [
                'docker', 'run',
                '--rm',
                '--network', 'none',
                '-m', f'{config["memory_limit"]}m',
                '-v', f'{temp_path}:/code/script.c',
                '-w', '/code',
                'gcc:latest',
                'gcc', '-o', 'script', 'script.c'
            ]
            
            # Compile first
            compile_result = subprocess.run(
                compile_cmd, 
                capture_output=True, 
                text=True, 
                timeout=30
            )
            
            if compile_result.returncode != 0:
                # Compilation failed
                end_time = time.time()
                return {
                    'success': False,
                    'output': compile_result.stdout,
                    'error': compile_result.stderr,
                    'execution_time': end_time - start_time,
                    'feedback': f"Compilation error: {compile_result.stderr}"
                }
            
            # If compilation succeeded, run the compiled program
            cmd = [
                'docker', 'run',
                '--rm',
                '--network', 'none' if not config['enable_network'] else 'bridge',
                '-m', f'{config["memory_limit"]}m',
                '-v', f'{os.path.dirname(temp_path)}:/code',
                '-w', '/code',
                '--ulimit', 'cpu=30',
                '--ulimit', f'fsize={1024 * 1024}',
                'gcc:latest',
                'timeout', str(config['timeout']), './script'
            ]
        else:
            # Unsupported language
            raise ValueError(f"Unsupported language: {config['language']}")
        
        # Execute the command
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=config['timeout'] + 5  # Add 5 seconds buffer to Docker timeout
        )
        
        # End time measurement
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Process results
        output = result.stdout
        error = result.stderr
        
        # Determine success based on return code and validation criteria
        success = result.returncode == 0
        feedback = ""
        
        # Apply validation criteria if provided
        if success and config['validation_criteria']:
            success, feedback = validate_output(output, config['validation_criteria'])
        elif not success:
            feedback = f"Execution error: {error}"
        
        return {
            'success': success,
            'output': output,
            'error': error,
            'execution_time': execution_time,
            'feedback': feedback
        }
    
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'output': '',
            'error': 'Execution timed out',
            'execution_time': config['timeout'],
            'feedback': 'Your code took too long to execute and was terminated.'
        }
    except Exception as e:
        logger.exception("Error executing code in sandbox")
        return {
            'success': False,
            'output': '',
            'error': str(e),
            'execution_time': 0,
            'feedback': f'An error occurred while executing your code: {str(e)}'
        }
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)


def validate_output(output: str, criteria: Dict[str, Any]) -> tuple:
    """
    Validate the output of code execution against certain criteria.
    
    Args:
        output: The output from code execution
        criteria: The validation criteria
        
    Returns:
        tuple: (success, feedback)
    """
    criteria_type = criteria.get('type', 'contains')
    
    if criteria_type == 'contains':
        # Check if output contains the required text
        required_text = criteria.get('text', '')
        if required_text in output:
            return True, "Success! Your code produced the expected output."
        else:
            return False, f"Your code did not produce the expected output. It should contain '{required_text}'."
    
    elif criteria_type == 'equals':
        # Check if output equals the required text
        required_text = criteria.get('text', '')
        if output.strip() == required_text.strip():
            return True, "Success! Your code produced the exact expected output."
        else:
            return False, f"Your code did not produce the expected output. It should be '{required_text}'."
    
    elif criteria_type == 'json':
        # Check if output is valid JSON and has required properties
        try:
            output_json = json.loads(output)
            required_props = criteria.get('properties', {})
            
            for prop, value in required_props.items():
                if prop not in output_json or output_json[prop] != value:
                    return False, f"Your code did not produce the expected JSON output. Missing or incorrect property: '{prop}'."
            
            return True, "Success! Your code produced valid JSON with the expected properties."
        except json.JSONDecodeError:
            return False, "Your code did not produce valid JSON output."
    
    elif criteria_type == 'regex':
        # Check if output matches a regular expression
        import re
        pattern = criteria.get('pattern', '')
        if re.search(pattern, output):
            return True, "Success! Your code output matches the expected pattern."
        else:
            return False, f"Your code did not produce output matching the expected pattern."
    
    return False, "Invalid validation criteria."
