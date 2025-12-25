-- GHL Integration Migration
-- Adds GoHighLevel integration fields and tables

-- Add GHL fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT,
ADD COLUMN IF NOT EXISTS ghl_location_id TEXT;

-- Add GHL sync tracking to enrollments
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS ghl_synced_at TIMESTAMPTZ;

-- Create GHL automations tracking table
CREATE TABLE IF NOT EXISTS ghl_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL,
  automation_id TEXT NOT NULL,
  automation_name TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GHL pipelines configuration table
CREATE TABLE IF NOT EXISTS ghl_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  pipeline_id TEXT NOT NULL,
  pipeline_name TEXT NOT NULL,
  default_stage_id TEXT,
  default_stage_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Create GHL sync logs table for error tracking
CREATE TABLE IF NOT EXISTS ghl_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'enroll', 'complete', 'revoke', etc.
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  ghl_response TEXT, -- JSON response from GHL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_ghl_contact_id ON users(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_users_ghl_location_id ON users(ghl_location_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_ghl_synced_at ON enrollments(ghl_synced_at);
CREATE INDEX IF NOT EXISTS idx_ghl_automations_enrollment_id ON ghl_automations(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_ghl_automations_contact_id ON ghl_automations(contact_id);
CREATE INDEX IF NOT EXISTS idx_ghl_pipelines_course_id ON ghl_pipelines(course_id);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_logs_user_id ON ghl_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_logs_enrollment_id ON ghl_sync_logs(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_logs_created_at ON ghl_sync_logs(created_at);

-- Enable Row Level Security
ALTER TABLE ghl_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ghl_automations (admin only)
CREATE POLICY "Admins can view all GHL automations"
  ON ghl_automations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.user_id', true)::uuid
      AND users.role = 'admin'
    )
  );

-- RLS Policies for ghl_pipelines (admin only)
CREATE POLICY "Admins can manage GHL pipelines"
  ON ghl_pipelines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.user_id', true)::uuid
      AND users.role = 'admin'
    )
  );

-- RLS Policies for ghl_sync_logs (admin only)
CREATE POLICY "Admins can view all GHL sync logs"
  ON ghl_sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.user_id', true)::uuid
      AND users.role = 'admin'
    )
  );




