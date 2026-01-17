# Supabase Setup Guide for Cloud Backup

## Step 1: Create Supabase Project

1. Go to: https://supabase.com/
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub (recommended) or email
4. Click "New Project"
5. Fill in:
   - **Name**: `fountain-macro-assistant`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient
6. Click "Create new project"
7. Wait 2-3 minutes for project to initialize

## Step 2: Get API Credentials

1. Once project is ready, go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (keep secret!)

## Step 3: Create Database Table

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Paste this SQL:

```sql
-- Create users table (if not using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create backups table
CREATE TABLE IF NOT EXISTS macro_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  macros JSONB NOT NULL,
  folders JSONB,
  macro_stats JSONB,
  settings JSONB,
  version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON macro_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON macro_backups(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE macro_backups ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own backups
CREATE POLICY "Users can view own backups"
  ON macro_backups FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Create policy: Users can insert own backups
CREATE POLICY "Users can insert own backups"
  ON macro_backups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Create policy: Users can update own backups
CREATE POLICY "Users can update own backups"
  ON macro_backups FOR UPDATE
  USING (auth.uid()::text = user_id::text);
```

4. Click "Run" to execute

## Step 4: Set Up Authentication (Optional - Use Supabase Auth)

If you want to use Supabase's built-in authentication:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email settings (optional)
4. Use Supabase Auth instead of custom auth

## Step 5: Configure API Keys

Add these to your Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anon public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service_role key (for admin operations)

Or create a `.env.local` file (for local development):
```
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Step 6: Test Connection

Use the SQL Editor to test:
```sql
SELECT * FROM macro_backups LIMIT 5;
```

## Next Steps

1. Update API endpoints to use Supabase client
2. Test backup/restore functionality
3. Deploy to Vercel with environment variables

## Free Tier Limits

- **Database size**: 500 MB
- **Bandwidth**: 2 GB/month
- **API requests**: Unlimited (with rate limiting)
- **Storage**: 1 GB
- **Auth users**: Unlimited

This is more than enough for macro backups!








