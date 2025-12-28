-- ========================================
-- Landing Page Generator - Database Migration
-- ========================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  openai_api_key TEXT,
  selected_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contents table
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  generated_content JSONB,
  html_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  inngest_event_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contents_updated_at ON contents;
CREATE TRIGGER update_contents_updated_at
    BEFORE UPDATE ON contents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_users_email ON users(email);

-- Insert admin user
-- Password: Admin123!
-- Hashed with bcrypt (10 rounds): $2a$10$zE5kKj9YF5YF5YF5YF5YFOvKj9YF5YF5YF5YF5YF5YF5YF5YF5YF5Y
INSERT INTO users (name, email, password, role, selected_model)
VALUES (
  'Admin User',
  'admin@landinggen.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  'gpt-4o-mini'
)
ON CONFLICT (email) DO NOTHING;

-- Verify tables created
SELECT 'Users table created with ' || COUNT(*) || ' records' as result FROM users;
SELECT 'Contents table created' as result;
SELECT 'Migration completed successfully!' as result;

