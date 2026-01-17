-- Supabase Database Schema for Fountain - Macro Assistant Cloud Backup
-- Run this in Supabase SQL Editor

-- Create users table (if not using Supabase Auth)
-- If using Supabase Auth, you can skip this and use auth.users instead
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create backups table
CREATE TABLE IF NOT EXISTS macro_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  macros JSONB NOT NULL DEFAULT '[]'::jsonb,
  folders JSONB DEFAULT '[]'::jsonb,
  macro_stats JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  version TEXT DEFAULT '1.0.1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON macro_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON macro_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_updated_at ON macro_backups(updated_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_macro_backups_updated_at 
  BEFORE UPDATE ON macro_backups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Optional, depends on auth setup
-- ALTER TABLE macro_backups ENABLE ROW LEVEL SECURITY;

-- If using Supabase Auth, create policies:
-- CREATE POLICY "Users can view own backups"
--   ON macro_backups FOR SELECT
--   USING (auth.uid()::text = user_id::text);
--
-- CREATE POLICY "Users can insert own backups"
--   ON macro_backups FOR INSERT
--   WITH CHECK (auth.uid()::text = user_id::text);
--
-- CREATE POLICY "Users can update own backups"
--   ON macro_backups FOR UPDATE
--   USING (auth.uid()::text = user_id::text);

-- Test query to verify table creation
SELECT 
  'Tables created successfully!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'macro_backups') as backups_table_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users') as users_table_exists;








