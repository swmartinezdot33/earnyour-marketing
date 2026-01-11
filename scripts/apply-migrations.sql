-- Run this in your Supabase SQL Editor to fix the missing status column
-- This is from migration 004_user_status.sql

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




