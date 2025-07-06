-- Update the users table to add the columns needed for password reset functionality
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL;
