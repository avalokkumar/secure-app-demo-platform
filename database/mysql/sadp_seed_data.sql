-- SADP MySQL Database Seed Data Script
-- This script populates the database with initial mock data for development and testing

USE sadp;

-- Helper function for UUID generation in MySQL
DELIMITER //
DROP FUNCTION IF EXISTS generate_uuid//
CREATE FUNCTION generate_uuid() RETURNS CHAR(36)
BEGIN
    RETURN UUID();
END//
DELIMITER ;

-- Insert admin user (password: password)
SET @admin_id = generate_uuid();
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES (
    @admin_id,
    'admin',
    'admin@sadp.com',
    -- This is a bcrypt hash for 'password'
    '$2b$12$tMdK8Gy1uo2S2NzF/BX1FODUCxUHSZxqUGAHAyVcT5okt22vTnEZe',
    'Admin',
    'User',
    'admin'
);

-- Insert regular user (password: password)
SET @user_id = generate_uuid();
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES (
    @user_id,
    'user',
    'user@sadp.com',
    -- This is a bcrypt hash for 'password'
    '$2b$12$QqP1c3BgAFmYYYi7Ae1qHe3XoGLCsRZ9FI.G5dCiRPaiPTJQOzqq.',
    'Regular',
    'User',
    'user'
);

-- Insert instructor user (password: password)
SET @instructor_id = generate_uuid();
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES (
    @instructor_id,
    'instructor',
    'instructor@sadp.com',
    -- This is a bcrypt hash for 'password'
    '$2b$12$FGkZ7vsdxGBxAHOm/Al7SuNc9FykRqjXu317MdwDWOZYU1Yn7jS3G',
    'Instructor',
    'User',
    'instructor'
);

-- Insert modules
SET @sql_injection_id = generate_uuid();
SET @xss_id = generate_uuid();
SET @csrf_id = generate_uuid();
SET @access_control_id = generate_uuid();
SET @buffer_overflow_id = generate_uuid();
SET @rce_id = generate_uuid();

INSERT INTO modules (id, name, slug, description, difficulty, order_index, is_active)
VALUES
    (@sql_injection_id, 'SQL Injection', 'sql-injection', 'Learn about SQL injection vulnerabilities and how to prevent them.', 'beginner', 1, TRUE),
    (@xss_id, 'Cross-Site Scripting (XSS)', 'xss', 'Understand and prevent Cross-Site Scripting attacks.', 'beginner', 2, TRUE),
    (@csrf_id, 'Cross-Site Request Forgery (CSRF)', 'csrf', 'Learn about CSRF attacks and proper protection mechanisms.', 'intermediate', 3, TRUE),
    (@access_control_id, 'Broken Access Control', 'broken-access-control', 'Understand access control vulnerabilities and secure implementation patterns.', 'intermediate', 4, TRUE),
    (@buffer_overflow_id, 'Buffer Overflow', 'buffer-overflow', 'Learn about buffer overflow vulnerabilities in C/C++ applications.', 'advanced', 5, TRUE),
    (@rce_id, 'Remote Code Execution', 'rce', 'Understand and prevent Remote Code Execution vulnerabilities.', 'advanced', 6, TRUE);

-- Insert lessons for SQL Injection module
SET @sql_intro_id = generate_uuid();
SET @sql_demo_id = generate_uuid();
SET @sql_prevent_id = generate_uuid();
SET @sql_practice_id = generate_uuid();
SET @sql_quiz_id = generate_uuid();

INSERT INTO lessons (id, module_id, title, slug, description, content_type, content, order_index, is_active)
VALUES
    (@sql_intro_id, @sql_injection_id, 'Introduction to SQL Injection', 'introduction', 'Overview of SQL injection attacks and their impact.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"SQL injection is a code injection technique that exploits vulnerabilities in the interface between web applications and database servers."}}]}', 1, TRUE),
    (@sql_demo_id, @sql_injection_id, 'SQL Injection Demonstration', 'demonstration', 'Interactive demonstration of SQL injection vulnerabilities.', 'demonstration', '{"blocks":[{"type":"paragraph","data":{"text":"In this demonstration, we will show how SQL injection can be exploited in a vulnerable application."}}]}', 2, TRUE),
    (@sql_prevent_id, @sql_injection_id, 'SQL Injection Prevention', 'prevention', 'Best practices for preventing SQL injection attacks.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"Learn how to use parameterized queries and other techniques to prevent SQL injection."}}]}', 3, TRUE),
    (@sql_practice_id, @sql_injection_id, 'Practice SQL Injection', 'practice', 'Hands-on exercise to practice identifying and exploiting SQL injection vulnerabilities.', 'exercise', '{"blocks":[{"type":"paragraph","data":{"text":"Try to find and exploit SQL injection vulnerabilities in this deliberately vulnerable application."}}]}', 4, TRUE),
    (@sql_quiz_id, @sql_injection_id, 'SQL Injection Quiz', 'quiz', 'Test your knowledge about SQL injection.', 'quiz', '{"blocks":[{"type":"paragraph","data":{"text":"Answer these questions to test your understanding of SQL injection vulnerabilities and prevention."}}]}', 5, TRUE);

-- Insert lessons for XSS module
SET @xss_intro_id = generate_uuid();
SET @xss_types_id = generate_uuid();
SET @xss_demo_id = generate_uuid();
SET @xss_prevent_id = generate_uuid();
SET @xss_practice_id = generate_uuid();

INSERT INTO lessons (id, module_id, title, slug, description, content_type, content, order_index, is_active)
VALUES
    (@xss_intro_id, @xss_id, 'Introduction to XSS', 'introduction', 'Overview of Cross-Site Scripting attacks and their impact.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"Cross-Site Scripting (XSS) is a type of security vulnerability that allows attackers to inject client-side scripts into web pages viewed by others."}}]}', 1, TRUE),
    (@xss_types_id, @xss_id, 'Types of XSS', 'types', 'Learn about different types of XSS attacks.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"There are three main types of XSS attacks: Stored XSS, Reflected XSS, and DOM-based XSS."}}]}', 2, TRUE),
    (@xss_demo_id, @xss_id, 'XSS Demonstration', 'demonstration', 'Interactive demonstration of XSS vulnerabilities.', 'demonstration', '{"blocks":[{"type":"paragraph","data":{"text":"In this demonstration, we will show how XSS can be exploited in a vulnerable application."}}]}', 3, TRUE),
    (@xss_prevent_id, @xss_id, 'XSS Prevention', 'prevention', 'Best practices for preventing XSS attacks.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"Learn how to use proper output encoding and other techniques to prevent XSS attacks."}}]}', 4, TRUE),
    (@xss_practice_id, @xss_id, 'Practice XSS', 'practice', 'Hands-on exercise to practice identifying and exploiting XSS vulnerabilities.', 'exercise', '{"blocks":[{"type":"paragraph","data":{"text":"Try to find and exploit XSS vulnerabilities in this deliberately vulnerable application."}}]}', 5, TRUE);

-- Insert code snippets for SQL Injection module
SET @sql_snippet_id = generate_uuid();
INSERT INTO code_snippets (id, lesson_id, title, description, vulnerable_code, secure_code, language, explanation)
VALUES
    (
        @sql_snippet_id,
        @sql_demo_id,
        'Basic SQL Injection Example',
        'A simple login function vulnerable to SQL injection.',
        
        -- Vulnerable Code
        'def login(username, password):
    # Vulnerable to SQL injection
    query = "SELECT * FROM users WHERE username = \'" + username + "\' AND password = \'" + password + "\'"
    result = db.execute(query)
    return result.fetchone() is not None

# Example exploitation: username = admin\' --
# This would bypass the password check',
        
        -- Secure Code
        'def login(username, password):
    # Safe from SQL injection using parameterized query
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    result = db.execute(query, (username, password))
    return result.fetchone() is not None',
        
        'python',
        
        'The vulnerable code directly concatenates user input into an SQL query, allowing attackers to manipulate the query structure. By using a parameterized query in the secure version, user input is treated as data rather than executable code, preventing SQL injection attacks.'
    );

-- Insert code snippets for XSS module
SET @xss_snippet_id = generate_uuid();
INSERT INTO code_snippets (id, lesson_id, title, description, vulnerable_code, secure_code, language, explanation)
VALUES
    (
        @xss_snippet_id,
        @xss_demo_id,
        'Reflected XSS Example',
        'A search function vulnerable to reflected XSS.',
        
        -- Vulnerable Code
        '@app.route("/search")
def search():
    query = request.args.get("q", "")
    # Vulnerable to XSS
    return f"<h1>Search results for: {query}</h1>"

# Example exploitation: /?q=<script>alert(\'XSS\')</script>',
        
        -- Secure Code
        '@app.route("/search")
def search():
    query = request.args.get("q", "")
    # Safe from XSS using HTML escaping
    return f"<h1>Search results for: {escape(query)}</h1>"',
        
        'python',
        
        'The vulnerable code directly inserts user input into the HTML response without sanitization. An attacker can inject malicious JavaScript that will execute in the victim\'s browser. The secure version uses HTML escaping to convert special characters to their HTML entity equivalents, preventing script execution.'
    );

-- Insert exercises for SQL Injection module
SET @sql_exercise_id = generate_uuid();
INSERT INTO exercises (id, lesson_id, title, description, instructions, sandbox_config, initial_code, success_criteria, hints)
VALUES
    (
        @sql_exercise_id,
        @sql_practice_id,
        'Find the SQL Injection vulnerability',
        'Identify and exploit a SQL injection vulnerability in a login form.',
        'Your task is to bypass the login authentication without knowing the password for the admin user.',
        '{"environment": "sql-injection-sandbox", "time_limit": 600, "memory_limit": 128}',
        
        'def login(username, password):
    # VULNERABLE CODE: Direct string concatenation
    query = "SELECT * FROM users WHERE username = \'" + username + "\' AND password = \'" + password + "\'"
    
    # Execute query
    cursor.execute(query)
    user = cursor.fetchone()
    
    if user:
        return True  # Login successful
    else:
        return False  # Login failed

# Your task is to rewrite this function to prevent SQL injection',
        
        'Successfully log in as the admin user without knowing the password.',
        '["Try using SQL comment syntax to ignore parts of the query", "Single quotes are often used to delimit strings in SQL", "The -- syntax is commonly used for SQL comments"]'
    );

-- Insert exercises for XSS module
SET @xss_exercise_id = generate_uuid();
INSERT INTO exercises (id, lesson_id, title, description, instructions, sandbox_config, initial_code, success_criteria, hints)
VALUES
    (
        @xss_exercise_id,
        @xss_practice_id,
        'Perform a Cross-Site Scripting attack',
        'Identify and exploit an XSS vulnerability in a comment form.',
        'Your task is to inject JavaScript code that will execute an alert() when a user views the comments.',
        '{"environment": "xss-sandbox", "time_limit": 600, "memory_limit": 128}',
        
        '@app.route("/comment", methods=["POST"])
def add_comment():
    comment = request.form.get("comment", "")
    author = request.form.get("author", "Anonymous")
    
    # Store comment in database
    save_comment(author, comment)
    
    # Return all comments including the new one
    comments = get_all_comments()
    result = "<h1>Comments</h1>"
    
    for c in comments:
        result += f"<div class=\'comment\'><strong>{c[\'author\']}</strong>: {c[\'text\']}</div>"
    
    return result

# Your task is to rewrite this function to prevent XSS attacks',
        
        'Successfully execute JavaScript in the context of the application.',
        '["HTML tags might not be filtered properly", "Try escaping out of existing HTML contexts", "Look for places where user input is directly displayed on the page"]'
    );

-- Insert user progress for the test user
-- For SQL Injection module
SET @progress_sql_intro = generate_uuid();
SET @progress_sql_demo = generate_uuid();
INSERT INTO user_progress (id, user_id, lesson_id, status, completed_at, score, attempts, last_attempt_at)
VALUES
    (@progress_sql_intro, @user_id, @sql_intro_id, 'completed', NOW(), NULL, 1, NOW()),
    (@progress_sql_demo, @user_id, @sql_demo_id, 'completed', NOW(), NULL, 1, NOW());

-- Insert user exercise submissions
SET @submission_id = generate_uuid();
INSERT INTO user_exercise_submissions (id, user_id, exercise_id, submitted_code, is_successful, feedback, execution_time)
VALUES
    (
        @submission_id,
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
        TRUE,
        'Great job! You correctly used parameterized queries to prevent SQL injection.',
        0.45
    );
