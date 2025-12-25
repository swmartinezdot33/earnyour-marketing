-- Add user status and deletion tracking
-- Supports soft deletion and user status management

-- Add status field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'));

-- Add deleted_at timestamp
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- Update existing users to have 'active' status
UPDATE users SET status = 'active' WHERE status IS NULL;




