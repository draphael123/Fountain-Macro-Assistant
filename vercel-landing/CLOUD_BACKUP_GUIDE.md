# Cloud Backup Guide - How to Save Macros to the Cloud

## Overview

Fountain - Macro Assistant provides multiple ways to save your macros to the cloud, ensuring they're safe and accessible from any device.

## Current Cloud Storage System

Your macros are stored in your **website account** (using browser localStorage). This means:
- ✅ **Free** - No additional costs
- ✅ **Private** - Your data stays in your browser
- ✅ **Automatic** - Syncs when you visit the website
- ✅ **Cross-device** - Access from any device when logged in

## How to Save Macros to the Cloud

### Method 1: From Extension (Recommended)

1. **Log in to your account:**
   - Open the extension popup
   - Click the extension icon
   - Go to **Options** (right-click extension icon → Options)
   - Click **"Log In / Sign Up"** in the Cloud Sync section
   - Create an account or log in

2. **Backup your macros:**
   - In the Options page, find the **"Cloud Sync"** section
   - Click **"☁️ Backup to Cloud"**
   - Wait for the confirmation message
   - Your macros are now saved to your account!

3. **Enable auto-sync (optional):**
   - Check the **"Auto-sync macros"** checkbox
   - Your macros will automatically backup when you make changes

### Method 2: From Extension Popup (Quick Backup)

1. **Log in first** (if not already logged in)
2. **Click the cloud icon (☁️)** in the extension popup header
3. Your macros are backed up instantly!

### Method 3: From Website Dashboard

1. **Log in to the website:**
   - Go to https://fountain-macro-assistant.vercel.app
   - Click **"Login"** or **"Dashboard"**
   - Create an account or log in

2. **Sync from extension:**
   - Go to your **Dashboard**
   - Find the **"Personal Macros"** section
   - Click **"Sync from Extension"**
   - This imports macros from your extension backup

3. **Upload macros manually:**
   - In the **"Personal Macros"** section
   - Click **"Import Personal Macros"**
   - Select a JSON file with your macros
   - Choose to merge or replace existing macros

## How Cloud Storage Works

### Storage Location

Your macros are stored in:
- **Your website account** (browser localStorage)
- **Extension local storage** (as backup)
- **Chrome sync storage** (for extension data)

### What Gets Saved

When you backup, the following is saved:
- ✅ All your macros (shortcuts, expansions, aliases)
- ✅ Folders and organization
- ✅ Macro statistics (usage counts)
- ✅ Extension settings
- ✅ Backup history (last 10 backups)

### Backup History

The system keeps:
- **Last 10 backups** - You can restore from any previous backup
- **Backup timestamps** - See when each backup was created
- **Macro counts** - Know how many macros are in each backup

## Restoring from Cloud

### From Extension

1. Open **Options** page
2. Click **"📥 Restore from Cloud"**
3. Confirm the restore
4. Your macros will be restored!

### From Website

1. Go to your **Dashboard**
2. Find **"Macro Backup & Sync"** section
3. View **"Backup History"**
4. Click **"Restore"** on any backup
5. Or click **"Download"** to save as JSON file

## Automatic Backup Options

### Scheduled Backups

1. Go to extension **Options**
2. Find **"Scheduled Backups"** dropdown
3. Choose:
   - **Hourly** - Backs up every hour
   - **Daily** - Backs up once per day
   - **Weekly** - Backs up once per week
4. Backups only run when you're logged in

### Auto-Sync on Changes

1. Enable **"Auto-sync macros"** checkbox
2. Macros automatically backup when you:
   - Add a new macro
   - Edit an existing macro
   - Delete a macro
   - Change settings

## Accessing Macros from Different Devices

### Same Browser, Different Computer

1. **Log in** to the website on the new computer
2. Your macros are automatically available
3. Use **"Sync from Extension"** to import them

### Different Browser

1. **Export macros** from the old browser:
   - Extension Options → Export as JSON
   - Or Dashboard → Download Personal Macros

2. **Import on new browser:**
   - Extension Options → Import Macros
   - Or Dashboard → Import Personal Macros

## Troubleshooting

### "Not logged in" Error

- Make sure you're logged in through the extension
- Go to Options → Click "Log In / Sign Up"
- Or log in on the website first

### Backup Not Showing

- Click **"Refresh Status"** on the dashboard
- Make sure you backed up from the extension
- Check that you're logged in with the same account

### Macros Not Syncing

- Check your internet connection
- Make sure you're logged in
- Try backing up again
- Check browser console for errors

## Best Practices

1. **Backup regularly** - Especially before making major changes
2. **Enable auto-sync** - Keeps your backups up to date automatically
3. **Keep multiple backups** - The system keeps 10 backups automatically
4. **Export as JSON** - For extra safety, download backups periodically
5. **Test restore** - Occasionally test restoring to ensure backups work

## Privacy & Security

- ✅ Your macros are stored **locally in your browser**
- ✅ No external servers store your data
- ✅ Only accessible when you're logged in
- ✅ Data is **not shared** with third parties
- ✅ You can delete backups anytime

## Future Enhancements

Potential improvements (not yet implemented):
- True cloud database (Supabase, Firebase)
- Real-time sync across devices
- Backup encryption
- Backup to Google Drive/Dropbox
- Automatic backup to external services

---

**Need Help?** Visit the forum or check the user guide for more information.





