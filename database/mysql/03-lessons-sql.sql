-- SADP MySQL Database Seed Data - 03: Lessons for SQL Injection
-- This script populates the lessons table with SQL Injection module lessons

USE sadp;

-- Variables to store IDs
SET @sql_module_id = (SELECT id FROM modules WHERE slug = 'sql-injection' LIMIT 1);

-- Insert lessons for SQL Injection module
INSERT INTO lessons (id, module_id, title, slug, description, content_type, content, order_index, is_active)
VALUES
    (
        UUID(), 
        @sql_module_id, 
        'Introduction to SQL Injection', 
        'introduction', 
        'Overview of SQL injection attacks and their impact.', 
        'theory', 
        'SQL injection is a code injection technique that exploits vulnerabilities in the interface between web applications and database servers. This attack occurs when user input is incorrectly filtered and directly included in SQL statements. Attackers can insert malicious SQL code that can read, modify, or delete data from your database.',
        1, 
        1
    ),
    (
        UUID(), 
        @sql_module_id, 
        'SQL Injection Demonstration', 
        'demonstration', 
        'Interactive demonstration of SQL injection vulnerabilities.', 
        'demonstration', 
        'In this demonstration, we will show how SQL injection can be exploited in a vulnerable application. We\'ll examine common mistakes in code and show how attackers can bypass authentication, extract data, or even destroy databases through malformed input.',
        2, 
        1
    ),
    (
        UUID(), 
        @sql_module_id, 
        'SQL Injection Prevention', 
        'prevention', 
        'Best practices for preventing SQL injection attacks.', 
        'theory', 
        'Learn how to use parameterized queries and other techniques to prevent SQL injection. We\'ll cover prepared statements, stored procedures, ORM frameworks, input validation, and least privilege principles to create secure database interactions.',
        3, 
        1
    ),
    (
        UUID(), 
        @sql_module_id, 
        'Practice SQL Injection', 
        'practice', 
        'Hands-on exercise to practice identifying and exploiting SQL injection vulnerabilities.', 
        'exercise', 
        'Try to find and exploit SQL injection vulnerabilities in this deliberately vulnerable application. Your goal is to bypass authentication and access restricted data without valid credentials.',
        4, 
        1
    ),
    (
        UUID(), 
        @sql_module_id, 
        'SQL Injection Quiz', 
        'quiz', 
        'Test your knowledge about SQL injection.', 
        'quiz', 
        'Answer these questions to test your understanding of SQL injection vulnerabilities and prevention techniques.',
        5, 
        1
    );
