-- Auto-generated SQL for inserting lessons
-- Generated on: 2025-07-02 09:22:00
-- Source: sql_injection_lessons.json

USE sadp;

-- Begin transaction
START TRANSACTION;

-- Get module IDs by slug to ensure foreign key constraints are met
SET @SQL_INJECTION_MODULE_ID = (SELECT id FROM modules WHERE slug = 'sql-injection');
SELECT IF(@SQL_INJECTION_MODULE_ID IS NULL, CONCAT('Error: Module with slug "sql-injection" not found'), 'Module found') AS module_check;

-- Insert lessons
INSERT INTO lessons (id, module_id, title, slug, description, content_type, content, order_index, is_active, created_at, updated_at)
VALUES
('7c298378-d16f-4538-88e5-5225f8f3b2e6', @SQL_INJECTION_MODULE_ID, 'Introduction to SQL Injection', 'introduction-to-sql-injection', 'Learn the fundamentals of SQL injection vulnerabilities and how they can be exploited.', 'theory', '# Introduction to SQL Injection

## What is SQL Injection?

SQL Injection is a code injection technique that exploits vulnerabilities in applications that interact with databases. It occurs when user-supplied data is not properly validated or sanitized before being included in SQL queries.

When successful, SQL injection attacks can allow attackers to:

- Access unauthorized data
- Modify database data
- Execute administrative operations on the database
- In some cases, issue commands to the operating system

## How SQL Injection Works

SQL injection works by inserting or "injecting" malicious SQL code into queries that an application sends to its database. When the application builds SQL statements dynamically by concatenating strings that include user-supplied input, attackers can manipulate these inputs to change the structure and logic of the intended SQL query.

### Example of Vulnerable Code

```php
$username = $_POST[''username''];
$password = $_POST[''password''];

$query = "SELECT * FROM users WHERE username = ''$username'' AND password = ''$password''";
$result = mysqli_query($connection, $query);
```

In this example, an attacker could input `admin'' --` as the username. The resulting query would be:

```sql
SELECT * FROM users WHERE username = ''admin'' --'' AND password = ''anything''
```

The `--` is a SQL comment that causes the rest of the query to be ignored, effectively bypassing the password check.', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c9896a09-558f-4ebb-9083-45fa74bf08c4', @SQL_INJECTION_MODULE_ID, 'Types of SQL Injection Attacks', 'types-of-sql-injection', 'Explore different types of SQL injection techniques and their impact.', 'theory', '# Types of SQL Injection Attacks

## In-band SQL Injection

In-band SQL injection is the most common and straightforward type of SQL injection attack. The attacker uses the same communication channel to both launch the attack and gather results.

### Error-based SQL Injection

Error-based SQL injection relies on error messages thrown by the database server to obtain information about the structure of the database. If an application displays database error messages to users, attackers can deliberately cause errors that reveal information.

### Union-based SQL Injection

UNION-based SQL injection uses the UNION SQL operator to combine the results of two or more SELECT statements into a single result, which is then returned as part of the HTTP response.

Example:
```
'' UNION SELECT username, password FROM users --
```

## Blind SQL Injection

Blind SQL injection occurs when an application is vulnerable to SQL injection, but its HTTP responses don''t contain the results of the SQL query or the details of any database errors.

### Boolean-based Blind SQL Injection

In boolean-based blind SQL injection, an attacker sends a SQL query to the database which forces the application to return a different result depending on whether the query returns TRUE or FALSE.

### Time-based Blind SQL Injection

Time-based blind SQL injection relies on the database pausing for a specified amount of time, then returning the results, allowing an attacker to determine if the result of a query is TRUE or FALSE based on the time the database takes to respond.

## Out-of-band SQL Injection

Out-of-band SQL injection occurs when an attacker is unable to use the same channel to launch the attack and gather results. Instead, data is retrieved using a different channel (e.g., making the database server send DNS or HTTP requests to a server controlled by the attacker).', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e6bb9ce1-b4b6-4651-ad0a-0df83a93da76', @SQL_INJECTION_MODULE_ID, 'SQL Injection Prevention Techniques', 'sql-injection-prevention', 'Learn best practices and techniques to prevent SQL injection vulnerabilities in your applications.', 'theory', '# SQL Injection Prevention Techniques

## 1. Use Parameterized Queries (Prepared Statements)

Parameterized queries are the most effective way to prevent SQL injection. They work by separating the SQL code from the data, ensuring that user input is never treated as part of the SQL command.

### Example in PHP (PDO)

```php
$stmt = $pdo->prepare(''SELECT * FROM users WHERE username = :username AND password = :password'');
$stmt->execute([''username'' => $username, ''password'' => $password]);
$user = $stmt->fetch();
```

### Example in Python

```python
cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
user = cursor.fetchone()
```

## 2. Use ORM Libraries

Object-Relational Mapping (ORM) libraries typically use parameterized queries behind the scenes, providing an additional layer of protection.

### Example with SQLAlchemy (Python)

```python
user = session.query(User).filter(User.username == username, User.password == password).first()
```

## 3. Input Validation

Validate user input to ensure it meets expected formats and constraints. While not a complete defense against SQL injection, it adds an important layer of security.

## 4. Escape Special Characters

If parameterized queries cannot be used, properly escape special characters in user inputs. However, this approach is less secure and more prone to errors than using parameterized queries.

## 5. Principle of Least Privilege

Ensure database accounts used by applications have the minimum privileges necessary. This limits the potential damage if an SQL injection vulnerability is exploited.

## 6. Use Stored Procedures

Stored procedures can provide protection against SQL injection if they don''t include dynamic SQL generation based on unvalidated inputs.

## 7. Keep Software Updated

Regularly update your database software, web application frameworks, and libraries to protect against known vulnerabilities.

## 8. Web Application Firewalls (WAFs)

Implement a WAF as an additional layer of defense to help filter out malicious SQL injection attempts.', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a2675b7b-fdff-4c0c-a11a-d7fc8c8103c9', @SQL_INJECTION_MODULE_ID, 'SQL Injection Practical Exercise', 'sql-injection-exercise', 'Practice identifying and exploiting SQL injection vulnerabilities in a controlled environment.', 'exercise', '# SQL Injection Practical Exercise

## Objective

In this exercise, you will practice identifying and exploiting SQL injection vulnerabilities in a controlled environment. You''ll also learn how to fix these vulnerabilities.

## Setup

1. Navigate to the SQL Injection practice module in the SADP platform
2. You''ll see a simple login form that is vulnerable to SQL injection

## Exercise 1: Basic Authentication Bypass

### Task

Bypass the login form without knowing a valid username or password.

### Hints

1. Try using SQL comments to modify the query logic
2. Remember that SQL comments in MySQL can be created using `--` or `#`
3. You''ll need to add a space after `--` for it to work as a comment

### Solution

Enter the following in the username field:
```
admin'' --
```

And anything (or nothing) in the password field.

### Explanation

The vulnerable code likely constructs a query like:
```sql
SELECT * FROM users WHERE username = ''$username'' AND password = ''$password''
```

Your input changes it to:
```sql
SELECT * FROM users WHERE username = ''admin'' -- '' AND password = ''anything''
```

The `--` comments out the password check, allowing you to log in as ''admin'' without knowing the password.

## Exercise 2: Data Extraction using UNION

### Task

Use a UNION-based SQL injection to extract user data from the database.

### Hints

1. First, determine the number of columns in the current query using `ORDER BY`
2. Use UNION SELECT to extract data from other tables
3. You may need to match data types across the UNION

## Exercise 3: Fixing the Vulnerabilities

### Task

Modify the vulnerable code to prevent SQL injection attacks.

### Solution

Replace the vulnerable code with parameterized queries:

```php
// Instead of:
$query = "SELECT * FROM users WHERE username = ''$username'' AND password = ''$password''";
$result = mysqli_query($connection, $query);

// Use:
$stmt = $connection->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();
```', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('58d2485a-867e-468b-a721-d9951a689d40', @SQL_INJECTION_MODULE_ID, 'SQL Injection in Real-World Applications', 'sql-injection-real-world', 'Examine real-world SQL injection vulnerabilities and their impact on organizations.', 'theory', '# SQL Injection in Real-World Applications

## Notable SQL Injection Attacks

### The Heartland Payment Systems Breach (2008)

Attackers used SQL injection to compromise Heartland Payment Systems, one of the largest payment processors in the United States. They installed malware that captured credit card data, affecting approximately 134 million credit cards.

**Impact**: Estimated financial losses exceeded $140 million in compensation payments and penalties.

### Sony Pictures (2011)

A group called LulzSec used SQL injection to breach Sony Pictures'' database, compromising personal information of over 1 million users, including passwords, email addresses, and dates of birth.

**Impact**: The breach cost Sony millions in security upgrades, legal fees, and damaged reputation.

### Yahoo Data Breach (2012)

Attackers used SQL injection to compromise a Yahoo database containing more than 450,000 user credentials.

**Impact**: The breach exposed unencrypted usernames and passwords, leading to potential account compromises across multiple platforms due to password reuse.

## Common Vulnerable Scenarios

### Legacy Applications

Many legacy applications were built before SQL injection was widely understood, making them particularly vulnerable. These applications often lack modern security controls and may use outdated coding practices.

### Content Management Systems (CMS)

Popular CMS platforms like WordPress, Joomla, and Drupal have been targets for SQL injection attacks, particularly through vulnerable plugins and themes.

### Custom Web Applications

Custom-built web applications often contain SQL injection vulnerabilities due to:
- Lack of developer security awareness
- Pressure to deliver features quickly
- Insufficient testing and code review

## Lessons Learned

### Security as a Process, Not a Product

Organizations that suffered major SQL injection breaches often treated security as a one-time implementation rather than an ongoing process.

### Defense in Depth

Successful attacks typically exploited multiple weaknesses. Having multiple layers of defense can prevent or limit the damage of SQL injection attacks.

### Regular Security Assessments

Regular security assessments, including vulnerability scanning and penetration testing, can identify SQL injection vulnerabilities before attackers do.

### Security Training

Developer awareness and training are crucial. Many SQL injection vulnerabilities result from a lack of understanding of secure coding practices.', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Commit transaction
COMMIT;

-- Verification queries
SELECT COUNT(*) AS total_lessons FROM lessons;

-- Display all lessons for verification
SELECT m.name AS module_name, l.title AS lesson_title, l.slug, l.order_index
FROM modules m
JOIN lessons l ON m.id = l.module_id
ORDER BY m.order_index, l.order_index;
