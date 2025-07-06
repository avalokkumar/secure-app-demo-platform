# Database Schema Documentation

This document provides detailed information about the database schema for the Secure Application Demo Platform (SADP).

## Entity Relationship Diagram

```
+------------------+       +------------------+       +------------------+
|      users       |       |     modules      |       |     lessons      |
+------------------+       +------------------+       +------------------+
| id (PK)          |       | id (PK)          |       | id (PK)          |
| username         |       | name             |       | module_id (FK)    |
| email            |       | slug             |       | title            |
| password_hash    |       | description      |       | slug             |
| first_name       |       | difficulty       |       | description      |
| last_name        |       | order_index      |       | content_type     |
| role             |       | is_active        |       | content          |
| is_active        |       | created_at       |       | order_index      |
| created_at       |       | updated_at       |       | is_active        |
| last_login       |       +--------+---------+       | created_at       |
+--------+---------+                |                 | updated_at       |
         |                          |                 +--------+---------+
         |                          |                          |
         |                          |                          |
+--------v---------+       +--------v---------+       +--------+---------+
| user_progress    |       |  user_sessions   |       |    exercises     |
+------------------+       +------------------+       +------------------+
| id (PK)          |       | id (PK)          |       | id (PK)          |
| user_id (FK)     |       | user_id (FK)     |       | lesson_id (FK)   |
| lesson_id (FK)   |       | token            |       | title            |
| status           |       | ip_address       |       | description      |
| completed_at     |       | user_agent       |       | instructions     |
| score            |       | expires_at       |       | sandbox_config   |
| attempts         |       | created_at       |       | success_criteria |
| last_attempt_at  |       +------------------+       | hints            |
| created_at       |                                  | created_at       |
| updated_at       |                                  | updated_at       |
+------------------+                                  +--------+---------+
                                                               |
+------------------+       +------------------+       +--------+---------+
|  code_snippets   |       | activity_logs    |       | user_exercise_   |
+------------------+       +------------------+       | submissions      |
| id (PK)          |       | id (PK)          |       +------------------+
| lesson_id (FK)   |       | user_id (FK)     |       | id (PK)          |
| title            |       | action           |       | user_id (FK)     |
| description      |       | entity_type      |       | exercise_id (FK) |
| vulnerable_code  |       | entity_id        |       | submitted_code   |
| secure_code      |       | details          |       | is_successful    |
| language         |       | ip_address       |       | feedback         |
| explanation      |       | created_at       |       | execution_time   |
| created_at       |       +------------------+       | created_at       |
| updated_at       |                                  +------------------+
+------------------+

+------------------+
| user_quiz_answers|
+------------------+
| id (PK)          |
| user_id (FK)     |
| lesson_id (FK)   |
| question_id      |
| selected_option  |
| is_correct       |
| created_at       |
+------------------+
```

## Table Descriptions

### users
Stores user account information and authentication details.
- **id**: UUID primary key
- **username**: Unique username for the user
- **email**: Unique email address for the user
- **password_hash**: Hashed password for secure authentication
- **first_name**: User's first name
- **last_name**: User's last name
- **role**: User role (user, admin, instructor)
- **is_active**: Whether the user account is active
- **created_at**: Timestamp of account creation
- **last_login**: Timestamp of last user login

### modules
Stores the main vulnerability modules available in the platform.
- **id**: UUID primary key
- **name**: Name of the module
- **slug**: URL-friendly identifier
- **description**: Detailed description of the module
- **difficulty**: Difficulty level (beginner, intermediate, advanced)
- **order_index**: Order in which modules are displayed
- **is_active**: Whether the module is currently active
- **created_at**: Timestamp of module creation
- **updated_at**: Timestamp of last module update

### lessons
Stores individual lessons within modules.
- **id**: UUID primary key
- **module_id**: Foreign key reference to modules table
- **title**: Lesson title
- **slug**: URL-friendly identifier
- **description**: Lesson description
- **content_type**: Type of lesson content (theory, demonstration, exercise, quiz)
- **content**: Lesson content in JSON format
- **order_index**: Order in which lessons are displayed within a module
- **is_active**: Whether the lesson is currently active
- **created_at**: Timestamp of lesson creation
- **updated_at**: Timestamp of last lesson update

### exercises
Stores interactive exercises for hands-on practice.
- **id**: UUID primary key
- **lesson_id**: Foreign key reference to lessons table
- **title**: Exercise title
- **description**: Brief description of the exercise
- **instructions**: Detailed instructions for completing the exercise
- **sandbox_config**: Configuration for the sandbox environment (JSON)
- **success_criteria**: Criteria for successful exercise completion
- **hints**: Hints for completing the exercise (JSON)
- **created_at**: Timestamp of exercise creation
- **updated_at**: Timestamp of last exercise update

### code_snippets
Stores vulnerable and secure code examples for side-by-side comparison.
- **id**: UUID primary key
- **lesson_id**: Foreign key reference to lessons table
- **title**: Snippet title
- **description**: Brief description of the code snippet
- **vulnerable_code**: Code with security vulnerability
- **secure_code**: Secure version of the code
- **language**: Programming language of the code snippet
- **explanation**: Explanation of the vulnerability and remediation
- **created_at**: Timestamp of snippet creation
- **updated_at**: Timestamp of last snippet update

### user_progress
Tracks user progress through lessons.
- **id**: UUID primary key
- **user_id**: Foreign key reference to users table
- **lesson_id**: Foreign key reference to lessons table
- **status**: Progress status (not_started, in_progress, completed, failed)
- **completed_at**: Timestamp of lesson completion
- **score**: Score achieved in the lesson (if applicable)
- **attempts**: Number of attempts made
- **last_attempt_at**: Timestamp of last attempt
- **created_at**: Timestamp of progress record creation
- **updated_at**: Timestamp of last progress update

### user_exercise_submissions
Stores user submissions for interactive exercises.
- **id**: UUID primary key
- **user_id**: Foreign key reference to users table
- **exercise_id**: Foreign key reference to exercises table
- **submitted_code**: Code submitted by the user
- **is_successful**: Whether the submission was successful
- **feedback**: Feedback on the submission
- **execution_time**: Time taken to execute the submission
- **created_at**: Timestamp of submission

### user_quiz_answers
Stores user responses to quiz questions.
- **id**: UUID primary key
- **user_id**: Foreign key reference to users table
- **lesson_id**: Foreign key reference to lessons table
- **question_id**: Identifier for the question
- **selected_option**: Option selected by the user
- **is_correct**: Whether the selected option is correct
- **created_at**: Timestamp of answer submission

### user_sessions
Tracks active user sessions for authentication.
- **id**: UUID primary key
- **user_id**: Foreign key reference to users table
- **token**: Session token
- **ip_address**: IP address of the user
- **user_agent**: User agent of the browser
- **expires_at**: Expiration timestamp for the session
- **created_at**: Session creation timestamp

### activity_logs
Provides an audit trail of user activities.
- **id**: UUID primary key
- **user_id**: Foreign key reference to users table
- **action**: Action performed by the user
- **entity_type**: Type of entity affected
- **entity_id**: Identifier of the affected entity
- **details**: Additional details about the action (JSON)
- **ip_address**: IP address of the user
- **created_at**: Timestamp of the action

## Views

### user_progress_summary
Provides a summary of user progress across all modules.
- **user_id**: User identifier
- **username**: Username
- **module_id**: Module identifier
- **module_name**: Module name
- **total_lessons**: Total number of lessons in the module
- **completed_lessons**: Number of completed lessons
- **completion_percentage**: Percentage of lessons completed

## Relationships

1. **One-to-Many: users to user_progress**
   - A user can have multiple progress records.

2. **One-to-Many: users to user_exercise_submissions**
   - A user can have multiple exercise submissions.

3. **One-to-Many: users to user_quiz_answers**
   - A user can have multiple quiz answers.

4. **One-to-Many: users to user_sessions**
   - A user can have multiple active sessions.

5. **One-to-Many: users to activity_logs**
   - A user can have multiple activity logs.

6. **One-to-Many: modules to lessons**
   - A module can have multiple lessons.

7. **One-to-Many: lessons to exercises**
   - A lesson can have multiple exercises.

8. **One-to-Many: lessons to code_snippets**
   - A lesson can have multiple code snippets.

9. **One-to-Many: exercises to user_exercise_submissions**
   - An exercise can have multiple user submissions.

## Indexes

The schema includes indexes for optimizing the most common queries:
- Indexes on foreign keys for faster joins
- Indexes on frequently searched fields
- Composite indexes for unique constraints

## Data Types

- **UUID**: Used for primary keys to ensure global uniqueness
- **VARCHAR**: Variable-length character strings with defined maximum lengths
- **TEXT**: Unlimited length text fields for large content
- **TIMESTAMP WITH TIME ZONE**: Date and time with timezone information
- **BOOLEAN**: True/false values
- **INTEGER**: Whole number values
- **JSONB**: Binary JSON format for structured data
- **DECIMAL**: Numeric values with fixed precision

## Constraints

- Foreign key constraints to maintain referential integrity
- CHECK constraints to enforce valid values (e.g., role types)
- UNIQUE constraints to prevent duplicate entries
- NOT NULL constraints for required fields

## Notes for Developers

1. Always use parameterized queries to prevent SQL injection.
2. Use transactions when making multiple related changes.
3. Consider the performance impact of complex queries on large tables.
4. The schema includes demonstration-focused tables and may not represent best practices for all production scenarios.
