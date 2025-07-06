-- SADP MySQL Database Schema Initialization
-- This script creates all required tables for the Secure Application Demo Platform

-- Create database if not exists
DROP DATABASE IF EXISTS sadp;
CREATE DATABASE sadp;
USE sadp;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('user', 'admin', 'instructor') NOT NULL DEFAULT 'user',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
) ENGINE=InnoDB;

-- Modules table
CREATE TABLE modules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    order_index INT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Lessons table
CREATE TABLE lessons (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    content_type ENUM('theory', 'demonstration', 'exercise', 'quiz') NOT NULL,
    content MEDIUMTEXT,
    order_index INT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE INDEX module_slug_idx (module_id, slug)
) ENGINE=InnoDB;

-- Exercises table
CREATE TABLE exercises (
    id VARCHAR(36) PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    sandbox_config TEXT,
    initial_code TEXT,
    success_criteria TEXT,
    hints TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Code snippets table
CREATE TABLE code_snippets (
    id VARCHAR(36) PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    vulnerable_code MEDIUMTEXT NOT NULL,
    secure_code MEDIUMTEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User progress table
CREATE TABLE user_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'failed') NOT NULL,
    completed_at TIMESTAMP NULL,
    score INT,
    attempts INT DEFAULT 0,
    last_attempt_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE INDEX user_lesson_idx (user_id, lesson_id)
) ENGINE=InnoDB;

-- User exercise submissions table
CREATE TABLE user_exercise_submissions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    exercise_id VARCHAR(36) NOT NULL,
    submitted_code MEDIUMTEXT NOT NULL,
    is_successful TINYINT(1),
    feedback TEXT,
    execution_time DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User quiz answers table
CREATE TABLE user_quiz_answers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    selected_option VARCHAR(100) NOT NULL,
    is_correct TINYINT(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User sessions table
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Activity logs table
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Create indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_code_snippets_lesson_id ON code_snippets(lesson_id);
CREATE INDEX idx_user_exercise_submissions_user_id ON user_exercise_submissions(user_id);
CREATE INDEX idx_user_exercise_submissions_exercise_id ON user_exercise_submissions(exercise_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Create view for user progress summary
CREATE VIEW user_progress_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    m.id AS module_id,
    m.name AS module_name,
    COUNT(l.id) AS total_lessons,
    SUM(IF(up.status = 'completed', 1, 0)) AS completed_lessons,
    ROUND(
        (SUM(IF(up.status = 'completed', 1, 0)) / 
        IF(COUNT(l.id) = 0, 1, COUNT(l.id))) * 100
    ) AS completion_percentage
FROM 
    users u
    CROSS JOIN modules m
    LEFT JOIN lessons l ON m.id = l.module_id AND l.is_active = 1
    LEFT JOIN user_progress up ON u.id = up.user_id AND l.id = up.lesson_id
WHERE 
    u.is_active = 1
    AND m.is_active = 1
GROUP BY 
    u.id, u.username, m.id, m.name;
