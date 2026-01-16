# Quick Supabase Setup (5 Minutes)

## 1. Create Supabase Project (2 min)

1. Go to: **https://supabase.com/**
2. Click **"Start your project"** → Sign up with GitHub
3. Click **"New Project"**
4. Fill in:
   - Name: `fountain-macro-assistant`
   - Password: (save this!)
   - Region: (choose closest)
5. Click **"Create new project"**
6. Wait 2-3 minutes

## 2. Get API Keys (1 min)

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string starting with eyJ)

## 3. Create Database Table (1 min)

1. Go to **SQL Editor** in Supabase
2. Click **"New query"**
3. Copy and paste the contents of `SUPABASE_SQL_SCHEMA.sql`
4. Click **"Run"**
5. Should see "Tables created successfully!"

## 4. Add to Vercel Environment Variables (1 min)

1. Go to: **https://vercel.com/dashboard**
2. Select your `fountain-macro-assistant` project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

   **Variable 1:**
   - Name: `SUPABASE_URL`
   - Value: Your Project URL (from step 2)
   - Environment: Production, Preview, Development
   - Click "Save"

   **Variable 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: Your anon public key (from step 2)
   - Environment: Production, Preview, Development
   - Click "Save"

5. **Redeploy** your Vercel project for changes to take effect

## 5. Install Supabase Package

Run in terminal:
```bash
cd vercel-landing
npm install @supabase/supabase-js
```

Or add to `package.json` (already done):
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

## Done! ✅

Your Supabase setup is complete. The API endpoints are ready to use:
- `/api/backup` - Saves macros to Supabase
- `/api/restore` - Restores macros from Supabase

## Test It

1. Deploy updated code to Vercel
2. Login through extension
3. Click "Backup to Cloud"
4. Check Supabase dashboard → Table Editor → `macro_backups` to see your backup!

## Next Steps

- Update `extension-auth.js` with your Supabase URL (if needed)
- Test backup/restore functionality
- Enable automatic backup in extension settings







