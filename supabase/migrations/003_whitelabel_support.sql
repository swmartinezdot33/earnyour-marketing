-- Whitelabel Support Migration
-- Adds tables for managing whitelabeled GHL subaccounts

-- Create whitelabel_accounts table
CREATE TABLE IF NOT EXISTS whitelabel_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "EarnYour App"
  ghl_location_id TEXT NOT NULL,
  ghl_api_token TEXT NOT NULL, -- Encrypted in production
  branding JSONB DEFAULT '{}', -- { logo, primaryColor, secondaryColor }
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ghl_location_id)
);

-- Create whitelabel_user_assignments table
CREATE TABLE IF NOT EXISTS whitelabel_user_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  whitelabel_id UUID REFERENCES whitelabel_accounts(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, whitelabel_id)
);

-- Add whitelabel_id to users table for quick lookup
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS whitelabel_id UUID REFERENCES whitelabel_accounts(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whitelabel_accounts_owner_id ON whitelabel_accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_whitelabel_accounts_ghl_location_id ON whitelabel_accounts(ghl_location_id);
CREATE INDEX IF NOT EXISTS idx_whitelabel_accounts_status ON whitelabel_accounts(status);
CREATE INDEX IF NOT EXISTS idx_whitelabel_user_assignments_user_id ON whitelabel_user_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_whitelabel_user_assignments_whitelabel_id ON whitelabel_user_assignments(whitelabel_id);
CREATE INDEX IF NOT EXISTS idx_users_whitelabel_id ON users(whitelabel_id);

-- Enable Row Level Security
ALTER TABLE whitelabel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelabel_user_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whitelabel_accounts
-- Owners can view and manage their own whitelabel accounts
CREATE POLICY "Owners can manage their whitelabel accounts"
  ON whitelabel_accounts FOR ALL
  USING (
    owner_id = current_setting('app.user_id', true)::uuid
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.user_id', true)::uuid
      AND users.role = 'admin'
    )
  );

-- Users can view their assigned whitelabel account
CREATE POLICY "Users can view their assigned whitelabel account"
  ON whitelabel_accounts FOR SELECT
  USING (
    id IN (
      SELECT whitelabel_id FROM whitelabel_user_assignments
      WHERE user_id = current_setting('app.user_id', true)::uuid
    )
    OR owner_id = current_setting('app.user_id', true)::uuid
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.user_id', true)::uuid
      AND users.role = 'admin'
    )
  );

-- RLS Policies for whitelabel_user_assignments
-- Users can view their own assignments
CREATE POLICY "Users can view their own whitelabel assignments"
  ON whitelabel_user_assignments FOR SELECT
  USING (
    user_id = current_setting('app.user_id', true)::uuid
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.user_id', true)::uuid
      AND users.role = 'admin'
    )
  );

-- Admins and whitelabel owners can manage assignments
CREATE POLICY "Admins and owners can manage whitelabel assignments"
  ON whitelabel_user_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.user_id', true)::uuid
      AND users.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM whitelabel_accounts
      WHERE whitelabel_accounts.id = whitelabel_user_assignments.whitelabel_id
      AND whitelabel_accounts.owner_id = current_setting('app.user_id', true)::uuid
    )
  );




