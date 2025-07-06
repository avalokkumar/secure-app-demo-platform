-- SADP MySQL Database Seed Data - 06: Exercises
-- This script populates the exercises table with practice exercises

USE sadp;

-- Variables to store lesson IDs
SET @sql_practice_id = (SELECT id FROM lessons WHERE slug = 'practice' AND module_id = (SELECT id FROM modules WHERE slug = 'sql-injection') LIMIT 1);
SET @xss_practice_id = (SELECT id FROM lessons WHERE slug = 'practice' AND module_id = (SELECT id FROM modules WHERE slug = 'xss') LIMIT 1);

-- Insert exercises for SQL Injection module
INSERT INTO exercises (id, lesson_id, title, description, instructions, sandbox_config, initial_code, success_criteria, hints)
VALUES
    (
        UUID(),
        @sql_practice_id,
        'Find the SQL Injection vulnerability',
        'Identify and exploit a SQL injection vulnerability in a login form.',
        'Your task is to bypass the login authentication without knowing the password for the admin user.',
        '{\"environment\": \"sql-injection-sandbox\", \"time_limit\": 600, \"memory_limit\": 128}',
        
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
        '[\"Try using SQL comment syntax to ignore parts of the query\", \"Single quotes are often used to delimit strings in SQL\", \"The -- syntax is commonly used for SQL comments\"]'
    );

-- Insert exercises for XSS module
INSERT INTO exercises (id, lesson_id, title, description, instructions, sandbox_config, initial_code, success_criteria, hints)
VALUES
    (
        UUID(),
        @xss_practice_id,
        'Perform a Cross-Site Scripting attack',
        'Identify and exploit an XSS vulnerability in a comment form.',
        'Your task is to inject JavaScript code that will execute an alert() when a user views the comments.',
        '{\"environment\": \"xss-sandbox\", \"time_limit\": 600, \"memory_limit\": 128}',
        
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
        '[\"HTML tags might not be filtered properly\", \"Try escaping out of existing HTML contexts\", \"Look for places where user input is directly displayed on the page\"]'
    );
