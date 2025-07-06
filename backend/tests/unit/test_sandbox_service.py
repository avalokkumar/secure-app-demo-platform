"""
Unit tests for the sandbox service.
"""
from unittest.mock import patch, MagicMock
import subprocess
import pytest

from services.sandbox import execute_in_sandbox, validate_output


def test_validate_output_contains():
    """Test validating output with 'contains' criteria."""
    # Output contains the required text
    success, feedback = validate_output(
        "Hello, world!",
        {'type': 'contains', 'text': 'Hello'}
    )
    assert success is True
    assert "Success" in feedback
    
    # Output does not contain the required text
    success, feedback = validate_output(
        "Hello, world!",
        {'type': 'contains', 'text': 'Python'}
    )
    assert success is False
    assert "did not produce the expected output" in feedback


def test_validate_output_equals():
    """Test validating output with 'equals' criteria."""
    # Output equals the required text
    success, feedback = validate_output(
        "Hello, world!",
        {'type': 'equals', 'text': 'Hello, world!'}
    )
    assert success is True
    assert "Success" in feedback
    
    # Output equals the required text (with whitespace trimming)
    success, feedback = validate_output(
        "Hello, world!\n",
        {'type': 'equals', 'text': 'Hello, world!'}
    )
    assert success is True
    assert "Success" in feedback
    
    # Output does not equal the required text
    success, feedback = validate_output(
        "Hello, world!",
        {'type': 'equals', 'text': 'Hello, Python!'}
    )
    assert success is False
    assert "did not produce the expected output" in feedback


def test_validate_output_json():
    """Test validating output with 'json' criteria."""
    # Valid JSON with required properties
    success, feedback = validate_output(
        '{"name": "John", "age": 30}',
        {'type': 'json', 'properties': {'name': 'John'}}
    )
    assert success is True
    assert "Success" in feedback
    
    # Valid JSON but missing required properties
    success, feedback = validate_output(
        '{"name": "John", "age": 30}',
        {'type': 'json', 'properties': {'name': 'John', 'city': 'New York'}}
    )
    assert success is False
    assert "Missing or incorrect property" in feedback
    
    # Invalid JSON
    success, feedback = validate_output(
        'Not a JSON string',
        {'type': 'json', 'properties': {'name': 'John'}}
    )
    assert success is False
    assert "did not produce valid JSON output" in feedback


def test_validate_output_regex():
    """Test validating output with 'regex' criteria."""
    # Output matches the pattern
    success, feedback = validate_output(
        "Email: user@example.com",
        {'type': 'regex', 'pattern': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'}
    )
    assert success is True
    assert "Success" in feedback
    
    # Output does not match the pattern
    success, feedback = validate_output(
        "Email: invalid-email",
        {'type': 'regex', 'pattern': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'}
    )
    assert success is False
    assert "did not produce output matching the expected pattern" in feedback


@patch('services.sandbox.subprocess.run')
@patch('services.sandbox.tempfile.NamedTemporaryFile')
def test_execute_in_sandbox_python_success(mock_tempfile, mock_subprocess_run):
    """Test executing Python code in sandbox successfully."""
    # Mock the temporary file
    mock_file = MagicMock()
    mock_file.name = '/tmp/test_script.py'
    mock_tempfile.return_value.__enter__.return_value = mock_file
    
    # Mock the subprocess.run result
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_result.stdout = "Hello, world!"
    mock_result.stderr = ""
    mock_subprocess_run.return_value = mock_result
    
    # Execute code in sandbox
    result = execute_in_sandbox(
        'print("Hello, world!")',
        {'language': 'python', 'timeout': 5, 'memory_limit': 64}
    )
    
    # Check result
    assert result['success'] is True
    assert result['output'] == "Hello, world!"
    assert result['error'] == ""
    assert result['execution_time'] >= 0
    
    # Verify subprocess.run was called with correct arguments
    mock_subprocess_run.assert_called_once()
    args = mock_subprocess_run.call_args[0][0]
    assert 'docker' in args
    assert 'run' in args
    assert '--rm' in args  # Container should be removed after execution
    assert '--network' in args  # Network isolation should be configured
    assert '-m' in args  # Memory limit should be set
    assert 'python:3.9-slim' in args  # Should use Python image
    assert 'timeout' in args  # Should use timeout command
    assert '5' in args  # Timeout value should be passed


@patch('services.sandbox.subprocess.run')
@patch('services.sandbox.tempfile.NamedTemporaryFile')
def test_execute_in_sandbox_python_error(mock_tempfile, mock_subprocess_run):
    """Test executing Python code in sandbox with error."""
    # Mock the temporary file
    mock_file = MagicMock()
    mock_file.name = '/tmp/test_script.py'
    mock_tempfile.return_value.__enter__.return_value = mock_file
    
    # Mock the subprocess.run result
    mock_result = MagicMock()
    mock_result.returncode = 1
    mock_result.stdout = ""
    mock_result.stderr = "Traceback (most recent call last):\n  File \"script.py\", line 1\n    print(undefined_variable)\nNameError: name 'undefined_variable' is not defined"
    mock_subprocess_run.return_value = mock_result
    
    # Execute code in sandbox
    result = execute_in_sandbox(
        'print(undefined_variable)',
        {'language': 'python', 'timeout': 5, 'memory_limit': 64}
    )
    
    # Check result
    assert result['success'] is False
    assert result['error'] == "Traceback (most recent call last):\n  File \"script.py\", line 1\n    print(undefined_variable)\nNameError: name 'undefined_variable' is not defined"
    assert result['execution_time'] >= 0
    assert "Execution error" in result['feedback']


@patch('services.sandbox.subprocess.run')
@patch('services.sandbox.tempfile.NamedTemporaryFile')
def test_execute_in_sandbox_timeout(mock_tempfile, mock_subprocess_run):
    """Test executing code in sandbox with timeout."""
    # Mock the temporary file
    mock_file = MagicMock()
    mock_file.name = '/tmp/test_script.py'
    mock_tempfile.return_value.__enter__.return_value = mock_file
    
    # Mock the subprocess.run to raise TimeoutExpired
    mock_subprocess_run.side_effect = subprocess.TimeoutExpired(cmd='', timeout=5)
    
    # Execute code in sandbox
    result = execute_in_sandbox(
        'while True: pass',  # Infinite loop
        {'language': 'python', 'timeout': 5, 'memory_limit': 64}
    )
    
    # Check result
    assert result['success'] is False
    assert 'timeout' in result['error'].lower()
    assert result['execution_time'] == 5  # Should be the timeout value
    assert "took too long" in result['feedback']


@patch('services.sandbox.subprocess.run')
@patch('services.sandbox.tempfile.NamedTemporaryFile')
def test_execute_in_sandbox_validation(mock_tempfile, mock_subprocess_run):
    """Test executing code in sandbox with output validation."""
    # Mock the temporary file
    mock_file = MagicMock()
    mock_file.name = '/tmp/test_script.py'
    mock_tempfile.return_value.__enter__.return_value = mock_file
    
    # Mock the subprocess.run result
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_result.stdout = "The answer is: 42"
    mock_result.stderr = ""
    mock_subprocess_run.return_value = mock_result
    
    # Execute code in sandbox with validation criteria
    result = execute_in_sandbox(
        'print("The answer is: 42")',
        {
            'language': 'python',
            'timeout': 5,
            'memory_limit': 64,
            'validation_criteria': {
                'type': 'contains',
                'text': '42'
            }
        }
    )
    
    # Check result
    assert result['success'] is True
    assert result['output'] == "The answer is: 42"
    assert "Success" in result['feedback']
    
    # Now try with failing validation
    mock_result.stdout = "The answer is: 24"
    mock_subprocess_run.return_value = mock_result
    
    result = execute_in_sandbox(
        'print("The answer is: 24")',
        {
            'language': 'python',
            'timeout': 5,
            'memory_limit': 64,
            'validation_criteria': {
                'type': 'contains',
                'text': '42'
            }
        }
    )
    
    # Check result
    assert result['success'] is False
    assert result['output'] == "The answer is: 24"
    assert "did not produce the expected output" in result['feedback']
