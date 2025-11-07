-- Create admin password configuration table
CREATE TABLE IF NOT EXISTS admin_password (
  id SERIAL PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default password (bcrypt hash of "12345")
INSERT INTO admin_password (password_hash) 
VALUES ('$2b$10$2jzWag7AaiKmfU8DXMpFUuNPXquz1GSh5q01BFOMUiAGzyfUZmHr.');

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

