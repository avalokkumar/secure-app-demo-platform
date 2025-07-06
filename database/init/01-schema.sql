-- SADP Database Schema Initialization
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT role_check CHECK (role IN ('user', 'admin', 'instructor'))
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT difficulty_check CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT content_type_check CHECK (content_type IN ('theory', 'demonstration', 'exercise', 'quiz')),
    UNIQUE (module_id, slug)
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    sandbox_config JSONB,
    success_criteria TEXT,
    hints JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vulnerable_snippets table
CREATE TABLE IF NOT EXISTS code_snippets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    vulnerable_code TEXT NOT NULL,
    secure_code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_check CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    UNIQUE (user_id, lesson_id)
);

-- Create user_exercise_submissions table
CREATE TABLE IF NOT EXISTS user_exercise_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    is_successful BOOLEAN,
    feedback TEXT,
    execution_time DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_quiz_answers table
CREATE TABLE IF NOT EXISTS user_quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    selected_option VARCHAR(100) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_session table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    m.id AS module_id,
    m.name AS module_name,
    COUNT(l.id) AS total_lessons,
    COUNT(up.id) FILTER (WHERE up.status = 'completed') AS completed_lessons,
    ROUND(
        (COUNT(up.id) FILTER (WHERE up.status = 'completed')::FLOAT / 
        NULLIF(COUNT(l.id), 0)::FLOAT) * 100
    ) AS completion_percentage
FROM 
    users u
    CROSS JOIN modules m
    LEFT JOIN lessons l ON m.id = l.module_id AND l.is_active = TRUE
    LEFT JOIN user_progress up ON u.id = up.user_id AND l.id = up.lesson_id
WHERE 
    u.is_active = TRUE
    AND m.is_active = TRUE
GROUP BY 
    u.id, u.username, m.id, m.name;

-- Comments
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE modules IS 'Stores vulnerability modules';
COMMENT ON TABLE lessons IS 'Stores individual lessons within modules';
COMMENT ON TABLE exercises IS 'Stores interactive exercises for lessons';
COMMENT ON TABLE code_snippets IS 'Stores vulnerable and secure code snippets for comparison';
COMMENT ON TABLE user_progress IS 'Tracks user progress through lessons';
COMMENT ON TABLE user_exercise_submissions IS 'Stores user submissions for exercises';
COMMENT ON TABLE user_quiz_answers IS 'Stores user answers to quiz questions';
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions';
COMMENT ON TABLE activity_logs IS 'Audit trail of user activities';
