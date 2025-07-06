-- SADP MySQL Database Seed Data - 07: User Progress
-- This script populates user progress and submissions tables

USE sadp;

-- Variables to store user IDs
SET @user_id = (SELECT id FROM users WHERE username = 'user' LIMIT 1);
SET @admin_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- Variables to store lesson IDs
SET @sql_intro_id = (SELECT id FROM lessons WHERE slug = 'introduction' AND module_id = (SELECT id FROM modules WHERE slug = 'sql-injection') LIMIT 1);
SET @sql_demo_id = (SELECT id FROM lessons WHERE slug = 'demonstration' AND module_id = (SELECT id FROM modules WHERE slug = 'sql-injection') LIMIT 1);

-- Variables to store exercise IDs
SET @sql_exercise_id = (SELECT id FROM exercises WHERE lesson_id = (SELECT id FROM lessons WHERE slug = 'practice' AND module_id = (SELECT id FROM modules WHERE slug = 'sql-injection')) LIMIT 1);

-- Insert user progress records
INSERT INTO user_progress (id, user_id, lesson_id, status, completed_at, score, attempts, last_attempt_at)
VALUES
    (UUID(), @user_id, @sql_intro_id, 'completed', NOW(), NULL, 1, NOW()),
    (UUID(), @user_id, @sql_demo_id, 'completed', NOW(), NULL, 1, NOW()),
    (UUID(), @admin_id, @sql_intro_id, 'completed', NOW(), NULL, 1, NOW()),
    (UUID(), @admin_id, @sql_demo_id, 'completed', NOW(), NULL, 1, NOW());

-- Insert user exercise submissions
INSERT INTO user_exercise_submissions (id, user_id, exercise_id, submitted_code, is_successful, feedback, execution_time)
VALUES
    (
        UUID(),
        @user_id,
        @sql_exercise_id,
        'def login(username, password):
    # SECURE CODE: Using parameterized queries
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    
    # Execute query with parameters
    cursor.execute(query, (username, password))
    user = cursor.fetchone()
    
    if user:
        return True  # Login successful
    else:
        return False  # Login failed',
        1,
        'Great job! You correctly used parameterized queries to prevent SQL injection.',
        0.45
    );
