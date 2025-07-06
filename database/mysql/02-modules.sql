-- SADP MySQL Database Seed Data - 02: Modules
-- This script populates the modules table with initial mock data

USE sadp;

-- Insert modules
INSERT INTO modules (id, name, slug, description, difficulty, order_index, is_active)
VALUES
    (UUID(), 'SQL Injection', 'sql-injection', 'Learn about SQL injection vulnerabilities and how to prevent them.', 'beginner', 1, 1),
    (UUID(), 'Cross-Site Scripting (XSS)', 'xss', 'Understand and prevent Cross-Site Scripting attacks.', 'beginner', 2, 1),
    (UUID(), 'Cross-Site Request Forgery (CSRF)', 'csrf', 'Learn about CSRF attacks and proper protection mechanisms.', 'intermediate', 3, 1),
    (UUID(), 'Broken Access Control', 'broken-access-control', 'Understand access control vulnerabilities and secure implementation patterns.', 'intermediate', 4, 1),
    (UUID(), 'Buffer Overflow', 'buffer-overflow', 'Learn about buffer overflow vulnerabilities in C/C++ applications.', 'advanced', 5, 1),
    (UUID(), 'Remote Code Execution', 'rce', 'Understand and prevent Remote Code Execution vulnerabilities.', 'advanced', 6, 1);
