-- Fix user_google_tokens table
-- Change user_id from UUID to TEXT to allow custom identifiers

-- Modify user_id column type from UUID to TEXT
ALTER TABLE user_google_tokens 
ALTER COLUMN user_id TYPE TEXT;

-- Make optional columns nullable (align with schema)
ALTER TABLE user_google_tokens 
ALTER COLUMN access_token DROP NOT NULL;

ALTER TABLE user_google_tokens 
ALTER COLUMN refresh_token DROP NOT NULL;

ALTER TABLE user_google_tokens 
ALTER COLUMN expiry_date DROP NOT NULL;

ALTER TABLE user_google_tokens 
ALTER COLUMN scope DROP NOT NULL;

ALTER TABLE user_google_tokens 
ALTER COLUMN token_type DROP NOT NULL;


