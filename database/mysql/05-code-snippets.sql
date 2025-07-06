-- SADP MySQL Database Seed Data - 05: Code Snippets
-- This script populates the code_snippets table with code examples

USE sadp;

-- Variables to store lesson IDs
SET @sql_demo_id = (SELECT id FROM lessons WHERE slug = 'demonstration' AND module_id = (SELECT id FROM modules WHERE slug = 'sql-injection') LIMIT 1);
SET @xss_demo_id = (SELECT id FROM lessons WHERE slug = 'demonstration' AND module_id = (SELECT id FROM modules WHERE slug = 'xss') LIMIT 1);

-- Insert code snippets for SQL Injection module
INSERT INTO code_snippets (id, lesson_id, title, description, vulnerable_code, secure_code, language, explanation)
VALUES
    (
        UUID(),
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
INSERT INTO code_snippets (id, lesson_id, title, description, vulnerable_code, secure_code, language, explanation)
VALUES
    (
        UUID(),
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
