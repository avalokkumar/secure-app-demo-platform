-- SADP MySQL Database Seed Data - 01: Users
-- This script populates the users table with initial mock data

USE sadp;

-- Insert admin user (password: password)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES (
    UUID(),
    'admin',
    'admin@sadp.com',
    -- This is a bcrypt hash for 'password'
    '$2a$12$FS5rjOVgpgLSkYGl1VbyqeUk16gfbJX9xHxgdZMWSVqtjA1wt/w8.',
    'Admin',
    'User',
    'admin'
);

-- Insert regular user (password: password)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES (
    UUID(),
    'user',
    'user@sadp.com',
    -- This is a bcrypt hash for 'password'
    '$2a$12$FS5rjOVgpgLSkYGl1VbyqeUk16gfbJX9xHxgdZMWSVqtjA1wt/w8.',
    'Regular',
    'User',
    'user'
);

-- Insert instructor user (password: password)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES (
    UUID(),
    'instructor',
    'instructor@sadp.com',
    -- This is a bcrypt hash for 'password'
    '$2a$12$FS5rjOVgpgLSkYGl1VbyqeUk16gfbJX9xHxgdZMWSVqtjA1wt/w8.',
    'Instructor',
    'User',
    'instructor'
);
