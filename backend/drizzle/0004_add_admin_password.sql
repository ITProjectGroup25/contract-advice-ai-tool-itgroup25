-- Create admin password configuration table
CREATE TABLE IF NOT EXISTS admin_password (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default password (bcrypt hash of "12345")
-- bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO admin_password (password_hash) 
VALUES ('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Create function to update password (for admin use)
CREATE OR REPLACE FUNCTION update_admin_password(new_hash TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_password 
  SET password_hash = new_hash, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- To change password, run in Supabase SQL Editor:
-- SELECT update_admin_password('your-new-bcrypt-hash');

