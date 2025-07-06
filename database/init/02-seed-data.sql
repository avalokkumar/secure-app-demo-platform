-- SADP Database Seed Data for Development
-- This file contains initial data to be loaded during development

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES (
    'admin',
    'admin@sadp.local',
    -- This is a bcrypt hash for 'admin123' - DO NOT USE IN PRODUCTION!
    '$2b$12$tMdK8Gy1uo2S2NzF/BX1FODUCxUHSZxqUGAHAyVcT5okt22vTnEZe',
    'Admin',
    'User',
    'admin'
);

-- Insert regular user (password: user123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES (
    'user',
    'user@sadp.local',
    -- This is a bcrypt hash for 'user123' - DO NOT USE IN PRODUCTION!
    '$2b$12$QqP1c3BgAFmYYYi7Ae1qHe3XoGLCsRZ9FI.G5dCiRPaiPTJQOzqq.',
    'Regular',
    'User',
    'user'
);

-- Insert instructor user (password: instructor123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES (
    'instructor',
    'instructor@sadp.local',
    -- This is a bcrypt hash for 'instructor123' - DO NOT USE IN PRODUCTION!
    '$2b$12$FGkZ7vsdxGBxAHOm/Al7SuNc9FykRqjXu317MdwDWOZYU1Yn7jS3G',
    'Instructor',
    'User',
    'instructor'
);

-- Insert modules
INSERT INTO modules (name, slug, description, difficulty, order_index, is_active)
VALUES
    ('SQL Injection', 'sql-injection', 'Learn about SQL injection vulnerabilities and how to prevent them.', 'beginner', 1, TRUE),
    ('Cross-Site Scripting (XSS)', 'xss', 'Understand and prevent Cross-Site Scripting attacks.', 'beginner', 2, TRUE),
    ('Cross-Site Request Forgery (CSRF)', 'csrf', 'Learn about CSRF attacks and proper protection mechanisms.', 'intermediate', 3, TRUE),
    ('Broken Access Control', 'broken-access-control', 'Understand access control vulnerabilities and secure implementation patterns.', 'intermediate', 4, TRUE),
    ('Buffer Overflow', 'buffer-overflow', 'Learn about buffer overflow vulnerabilities in C/C++ applications.', 'advanced', 5, TRUE),
    ('Remote Code Execution', 'rce', 'Understand and prevent Remote Code Execution vulnerabilities.', 'advanced', 6, TRUE);

-- Insert lessons for SQL Injection module
WITH module AS (SELECT id FROM modules WHERE slug = 'sql-injection' LIMIT 1)
INSERT INTO lessons (module_id, title, slug, description, content_type, content, order_index, is_active)
VALUES
    ((SELECT id FROM module), 'Introduction to SQL Injection', 'introduction', 'Overview of SQL injection attacks and their impact.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"SQL injection is a code injection technique that exploits vulnerabilities in the interface between web applications and database servers."}}]}', 1, TRUE),
    ((SELECT id FROM module), 'SQL Injection Demonstration', 'demonstration', 'Interactive demonstration of SQL injection vulnerabilities.', 'demonstration', '{"blocks":[{"type":"paragraph","data":{"text":"In this demonstration, we will show how SQL injection can be exploited in a vulnerable application."}}]}', 2, TRUE),
    ((SELECT id FROM module), 'SQL Injection Prevention', 'prevention', 'Best practices for preventing SQL injection attacks.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"Learn how to use parameterized queries and other techniques to prevent SQL injection."}}]}', 3, TRUE),
    ((SELECT id FROM module), 'Practice SQL Injection', 'practice', 'Hands-on exercise to practice identifying and exploiting SQL injection vulnerabilities.', 'exercise', '{"blocks":[{"type":"paragraph","data":{"text":"Try to find and exploit SQL injection vulnerabilities in this deliberately vulnerable application."}}]}', 4, TRUE),
    ((SELECT id FROM module), 'SQL Injection Quiz', 'quiz', 'Test your knowledge about SQL injection.', 'quiz', '{"blocks":[{"type":"paragraph","data":{"text":"Answer these questions to test your understanding of SQL injection vulnerabilities and prevention."}}]}', 5, TRUE);

-- Insert lessons for XSS module
WITH module AS (SELECT id FROM modules WHERE slug = 'xss' LIMIT 1)
INSERT INTO lessons (module_id, title, slug, description, content_type, content, order_index, is_active)
VALUES
    ((SELECT id FROM module), 'Introduction to XSS', 'introduction', 'Overview of Cross-Site Scripting attacks and their impact.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"Cross-Site Scripting (XSS) is a type of security vulnerability that allows attackers to inject client-side scripts into web pages viewed by others."}}]}', 1, TRUE),
    ((SELECT id FROM module), 'Types of XSS', 'types', 'Learn about different types of XSS attacks.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"There are three main types of XSS attacks: Stored XSS, Reflected XSS, and DOM-based XSS."}}]}', 2, TRUE),
    ((SELECT id FROM module), 'XSS Demonstration', 'demonstration', 'Interactive demonstration of XSS vulnerabilities.', 'demonstration', '{"blocks":[{"type":"paragraph","data":{"text":"In this demonstration, we will show how XSS can be exploited in a vulnerable application."}}]}', 3, TRUE),
    ((SELECT id FROM module), 'XSS Prevention', 'prevention', 'Best practices for preventing XSS attacks.', 'theory', '{"blocks":[{"type":"paragraph","data":{"text":"Learn how to use proper output encoding and other techniques to prevent XSS attacks."}}]}', 4, TRUE),
    ((SELECT id FROM module), 'Practice XSS', 'practice', 'Hands-on exercise to practice identifying and exploiting XSS vulnerabilities.', 'exercise', '{"blocks":[{"type":"paragraph","data":{"text":"Try to find and exploit XSS vulnerabilities in this deliberately vulnerable application."}}]}', 5, TRUE);

-- Insert code snippets for SQL Injection module
WITH lesson AS (SELECT id FROM lessons WHERE slug = 'demonstration' AND module_id = (SELECT id FROM modules WHERE slug = 'sql-injection') LIMIT 1)
INSERT INTO code_snippets (lesson_id, title, description, vulnerable_code, secure_code, language, explanation)
VALUES
    (
        (SELECT id FROM lesson),
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
WITH lesson AS (SELECT id FROM lessons WHERE slug = 'demonstration' AND module_id = (SELECT id FROM modules WHERE slug = 'xss') LIMIT 1)
INSERT INTO code_snippets (lesson_id, title, description, vulnerable_code, secure_code, language, explanation)
VALUES
    (
        (SELECT id FROM lesson),
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
WITH lesson AS (SELECT id FROM lessons WHERE slug = 'practice' AND module_id = (SELECT id FROM modules WHERE slug = 'sql-injection') LIMIT 1)
INSERT INTO exercises (lesson_id, title, description, instructions, sandbox_config, success_criteria, hints)
VALUES
    (
        (SELECT id FROM lesson),
        'Find the SQL Injection vulnerability',
        'Identify and exploit a SQL injection vulnerability in a login form.',
        'Your task is to bypass the login authentication without knowing the password for the admin user.',
        '{"environment": "sql-injection-sandbox", "time_limit": 600, "memory_limit": 128}',
        'Successfully log in as the admin user without knowing the password.',
        '["Try using SQL comment syntax to ignore parts of the query", "Single quotes are often used to delimit strings in SQL", "The -- syntax is commonly used for SQL comments"]'
    );

-- Insert exercises for XSS module
WITH lesson AS (SELECT id FROM lessons WHERE slug = 'practice' AND module_id = (SELECT id FROM modules WHERE slug = 'xss') LIMIT 1)
INSERT INTO exercises (lesson_id, title, description, instructions, sandbox_config, success_criteria, hints)
VALUES
    (
        (SELECT id FROM lesson),
        'Perform a Cross-Site Scripting attack',
        'Identify and exploit an XSS vulnerability in a comment form.',
        'Your task is to inject JavaScript code that will execute an alert() when a user views the comments.',
        '{"environment": "xss-sandbox", "time_limit": 600, "memory_limit": 128}',
        'Successfully execute JavaScript in the context of the application.',
        '["HTML tags might not be filtered properly", "Try escaping out of existing HTML contexts", "Look for places where user input is directly displayed on the page"]'
    );
