# Website Account-Based Cloud Backup

## Overview

Users can create accounts on the website and link the extension to their account. This enables cloud backup that persists even if the extension is uninstalled.

## How It Works

### 1. User Creates Account on Website
- Go to: https://fountain-macro-assistant.vercel.app/register.html
- Create account with email and password
- Account stored in website's system

### 2. User Logs In Through Extension
- Click "Login / Sign Up" button in extension popup
- Enter email and password
- Extension links to website account

### 3. Automatic Cloud Backup
- When logged in, macros are automatically backed up to cloud
- Backup happens:
  - When macros are created/edited/deleted
  - Periodically (if auto-backup enabled)
  - Manually via "Backup Now" button

### 4. Restore After Uninstall
- User uninstalls extension
- Macros are safely stored in cloud
- User reinstalls extension
- Logs in with same account
- Clicks "Restore from Cloud"
- All macros restored!

## Implementation Status

### ✅ Completed
- Login UI in extension popup
- Login UI in options page
- Account status display
- Backup/Restore buttons
- Extension-auth.js class created

### 🚧 Needs Implementation
- Backend API endpoints (database storage)
- Website-to-extension authentication flow
- Automatic backup on changes
- Uninstall detection

## Backend Options

### Option 1: Vercel Serverless Functions + Database
- Use Vercel serverless functions for API
- Store backups in database (Supabase, MongoDB, PostgreSQL)
- Free tier available

### Option 2: Firebase
- Firebase Authentication
- Firestore for backup storage
- Free tier available

### Option 3: Supabase (Recommended)
- Built-in authentication
- PostgreSQL database
- Free tier: 500MB database, 2GB bandwidth
- Easy to set up

## Next Steps

1. **Set up database** (Supabase recommended)
2. **Create API endpoints** for backup/restore
3. **Implement authentication flow** between website and extension
4. **Add automatic backup** on macro changes
5. **Add uninstall detection** with backup prompt

## Benefits

✅ **Data Safety**: Macros never lost, even after uninstall
✅ **Cross-Device**: Access from any device
✅ **Automatic**: Set it and forget it
✅ **Integrated**: Uses your existing website accounts
✅ **Free**: Can use free tier of database services








