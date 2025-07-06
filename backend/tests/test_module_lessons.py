"""
Test module to verify that lessons have been properly added to intermediate and advanced modules.
"""

import pytest
from models.module import Module
from models.lesson import Lesson

def test_csrf_lessons_exist(client):
    """Test that CSRF module has all required lessons."""
    # Find the CSRF module
    module = Module.query.filter_by(slug='csrf').first()
    assert module is not None, "CSRF module not found"
    
    # Check that at least 4 lessons exist
    lessons = Lesson.query.filter_by(module_id=module.id).all()
    assert len(lessons) >= 4, f"Expected at least 4 lessons in CSRF module, found {len(lessons)}"
    
    # Check for specific lessons by slug
    required_slugs = [
        'understanding-csrf-attacks',
        'csrf-protection-mechanisms',
        'implementing-csrf-protection',
        'csrf-testing-case-studies'
    ]
    
    for slug in required_slugs:
        lesson = Lesson.query.filter_by(module_id=module.id, slug=slug).first()
        assert lesson is not None, f"Required CSRF lesson '{slug}' not found"
    
    # Verify lesson content exists
    for lesson in lessons:
        assert lesson.content is not None and len(lesson.content) > 0, f"Lesson {lesson.slug} has no content"

def test_broken_access_control_lessons_exist(client):
    """Test that Broken Access Control module has all required lessons."""
    # Find the Broken Access Control module
    module = Module.query.filter_by(slug='broken-access-control').first()
    assert module is not None, "Broken Access Control module not found"
    
    # Check that at least 3 lessons exist
    lessons = Lesson.query.filter_by(module_id=module.id).all()
    assert len(lessons) >= 3, f"Expected at least 3 lessons in Broken Access Control module, found {len(lessons)}"
    
    # Check for specific lessons by slug
    required_slugs = [
        'understanding-access-control',
        'broken-access-control-vulnerabilities',
        'implementing-proper-access-controls'
    ]
    
    for slug in required_slugs:
        lesson = Lesson.query.filter_by(module_id=module.id, slug=slug).first()
        assert lesson is not None, f"Required Access Control lesson '{slug}' not found"
    
    # Verify lesson content exists
    for lesson in lessons:
        assert lesson.content is not None and len(lesson.content) > 0, f"Lesson {lesson.slug} has no content"

def test_buffer_overflow_lessons_exist(client):
    """Test that Buffer Overflow module has all required lessons."""
    # Find the Buffer Overflow module
    module = Module.query.filter_by(slug='buffer-overflow').first()
    assert module is not None, "Buffer Overflow module not found"
    
    # Check that at least 3 lessons exist
    lessons = Lesson.query.filter_by(module_id=module.id).all()
    assert len(lessons) >= 3, f"Expected at least 3 lessons in Buffer Overflow module, found {len(lessons)}"
    
    # Check for specific lessons by slug
    required_slugs = [
        'buffer-overflow-fundamentals',
        'stack-based-buffer-overflows',
        'buffer-overflow-mitigation'
    ]
    
    for slug in required_slugs:
        lesson = Lesson.query.filter_by(module_id=module.id, slug=slug).first()
        assert lesson is not None, f"Required Buffer Overflow lesson '{slug}' not found"
    
    # Verify lesson content exists
    for lesson in lessons:
        assert lesson.content is not None and len(lesson.content) > 0, f"Lesson {lesson.slug} has no content"

def test_remote_code_execution_lessons_exist(client):
    """Test that Remote Code Execution module has all required lessons."""
    # Find the Remote Code Execution module
    module = Module.query.filter_by(slug='rce').first()
    assert module is not None, "Remote Code Execution module not found"
    
    # Check that at least 3 lessons exist
    lessons = Lesson.query.filter_by(module_id=module.id).all()
    assert len(lessons) >= 3, f"Expected at least 3 lessons in Remote Code Execution module, found {len(lessons)}"
    
    # Check for specific lessons by slug
    required_slugs = [
        'introduction-to-rce',
        'command-injection-vulnerabilities',
        'securing-against-rce'
    ]
    
    for slug in required_slugs:
        lesson = Lesson.query.filter_by(module_id=module.id, slug=slug).first()
        assert lesson is not None, f"Required RCE lesson '{slug}' not found"
    
    # Verify lesson content exists
    for lesson in lessons:
        assert lesson.content is not None and len(lesson.content) > 0, f"Lesson {lesson.slug} has no content"

def test_lesson_progress_tracking(client, auth):
    """Test that lessons can be properly tracked for progress."""
    # Log in as test user
    auth.login()
    
    # Find a lesson to mark as completed
    csrf_module = Module.query.filter_by(slug='csrf').first()
    assert csrf_module is not None, "CSRF module not found"
    
    lesson = Lesson.query.filter_by(module_id=csrf_module.id).first()
    assert lesson is not None, "No lessons found in CSRF module"
    
    # Mark lesson as completed
    response = client.post('/api/progress', json={
        'lesson_id': lesson.id,
        'completed': True
    })
    assert response.status_code == 200, f"Failed to mark lesson as completed: {response.data}"
    
    # Verify progress was updated
    response = client.get('/api/progress')
    assert response.status_code == 200, f"Failed to get user progress: {response.data}"
    
    # Check that progress includes the completed lesson
    data = response.get_json()
    lesson_progress = next((p for p in data if p['lesson_id'] == lesson.id), None)
    assert lesson_progress is not None, f"Progress for lesson {lesson.id} not found"
    assert lesson_progress['completed'] is True, f"Lesson {lesson.id} not marked as completed in progress"
