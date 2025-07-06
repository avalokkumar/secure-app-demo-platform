-- SADP MySQL Database Seed Data - 04: Lessons for XSS
-- This script populates the lessons table with Cross-Site Scripting module lessons

USE sadp;

-- Variables to store IDs
SET @xss_module_id = (SELECT id FROM modules WHERE slug = 'xss' LIMIT 1);

-- Insert lessons for XSS module
INSERT INTO lessons (id, module_id, title, slug, description, content_type, content, order_index, is_active)
VALUES
    (
        UUID(), 
        @xss_module_id, 
        'Introduction to XSS', 
        'introduction', 
        'Overview of Cross-Site Scripting attacks and their impact.', 
        'theory', 
        'Cross-Site Scripting (XSS) is a type of security vulnerability that allows attackers to inject client-side scripts into web pages viewed by others. These attacks occur when a web application includes untrusted data in a new web page without proper validation or escaping.',
        1, 
        1
    ),
    (
        UUID(), 
        @xss_module_id, 
        'Types of XSS', 
        'types', 
        'Learn about different types of XSS attacks.', 
        'theory', 
        'There are three main types of XSS attacks: Stored XSS (persistent), where the malicious script is stored on the target server; Reflected XSS (non-persistent), where the malicious script is reflected off the web server such as in search results; and DOM-based XSS, which occurs entirely in the browser when client-side JavaScript modifies the DOM in an unsafe way.',
        2, 
        1
    ),
    (
        UUID(), 
        @xss_module_id, 
        'XSS Demonstration', 
        'demonstration', 
        'Interactive demonstration of XSS vulnerabilities.', 
        'demonstration', 
        'In this demonstration, we will show how XSS can be exploited in a vulnerable application. We\'ll examine common vulnerabilities in web applications and demonstrate how attackers can inject malicious scripts that steal cookies, redirect users to malicious sites, or manipulate the DOM.',
        3, 
        1
    ),
    (
        UUID(), 
        @xss_module_id, 
        'XSS Prevention', 
        'prevention', 
        'Best practices for preventing XSS attacks.', 
        'theory', 
        'Learn how to use proper output encoding and other techniques to prevent XSS attacks. We\'ll cover context-specific output encoding, content security policy (CSP), input validation, and safe JavaScript frameworks to create secure web applications resistant to XSS vulnerabilities.',
        4, 
        1
    ),
    (
        UUID(), 
        @xss_module_id, 
        'Practice XSS', 
        'practice', 
        'Hands-on exercise to practice identifying and exploiting XSS vulnerabilities.', 
        'exercise', 
        'Try to find and exploit XSS vulnerabilities in this deliberately vulnerable application. Your goal is to inject JavaScript code that will execute when a user views the page.',
        5, 
        1
    );
