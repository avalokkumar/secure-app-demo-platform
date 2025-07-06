-- Update users table to add reset token columns
USE sadp;

-- Add reset_token and reset_token_expires_at columns if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP NULL;

-- Verify the changes
DESCRIBE users;
