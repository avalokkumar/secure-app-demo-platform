-- Modify the token column in the user_sessions table to accommodate longer JWT tokens
ALTER TABLE user_sessions MODIFY token VARCHAR(512);
