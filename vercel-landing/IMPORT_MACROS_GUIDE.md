# Guide: How to Import Macros into Fountain - Macro Assistant

This guide will walk you through different ways to import macros into the Fountain - Macro Assistant extension.

---

## Table of Contents

1. [Import from JSON File](#import-from-json-file)
2. [Import Shared Macros from the Library](#import-shared-macros-from-the-library)
3. [Import by Share Code](#import-by-share-code)
4. [Import from Extension Backup](#import-from-extension-backup)
5. [Troubleshooting](#troubleshooting)

---

## Import from JSON File

### Step 1: Prepare Your JSON File

Your JSON file should contain an array of macro objects. Each macro should have at least these properties:

```json
[
  {
    "id": "unique-id-1",
    "shortcut": "/email",
    "expansion": "your.email@example.com",
    "caseSensitive": false,
    "aliases": ["/e", "/mail"],
    "tags": ["email", "contact"],
    "folderId": "optional-folder-id",
    "conditions": {
      "timeRange": {
        "start": 9,
        "end": 17
      },
      "weekdayOnly": true
    }
  },
  {
    "id": "unique-id-2",
    "shortcut": "/signature",
    "expansion": "Best regards,\nJohn Doe"
  }
]
```

**Required fields:**
- `id`: A unique identifier (string or number)
- `shortcut`: The trigger text (e.g., "/email")
- `expansion`: The text that replaces the shortcut

**Optional fields:**
- `aliases`: Array of alternative shortcuts
- `tags`: Array of tags for organization
- `caseSensitive`: Boolean (default: false)
- `folderId`: ID of folder to organize macro
- `conditions`: Conditional expansion settings

### Step 2: Open Extension Options

1. **Right-click** the Fountain extension icon in your Chrome toolbar
2. Select **"Options"** from the context menu

   OR

1. Click the **puzzle piece icon** (🧩) in Chrome's toolbar
2. Find **"Fountain - Macro Assistant"**
3. Click the **three dots** (⋮) next to it
4. Select **"Options"**

### Step 3: Import the JSON File

1. In the Options page, scroll down to the **"Data Management"** section
2. Click the **"Import Macros"** button
3. A file picker will open
4. Select your JSON file
5. The macros will be imported automatically

### Step 4: Verify Import

1. Open the extension popup
2. Check that your imported macros appear in the list
3. If you have duplicate shortcuts, only new macros will be added (duplicates are skipped)

---

## Import Shared Macros from the Library

### Method 1: From the Website

1. Visit the [Shared Macros Library](https://fountain-macro-assistant.vercel.app/shared.html)
2. Browse the available shared macros or use the search bar
3. Click on a macro card you want to import
4. Click the **"Import Macros"** button
5. The macro data will be stored for the extension to pick up
6. Open the extension **Options** page
7. Click **"Import Shared Macros"** button
8. The imported macros will be added to your extension

### Method 2: Using Share Code

1. Get a 6-character share code from another user (e.g., "ABC123")
2. Visit the Shared Macros Library
3. Click the **"Import by Code"** tab
4. Enter the 6-character code
5. Click **"Import"**
6. Follow steps 6-8 from Method 1 above

### Method 3: Direct URL

If someone shares a link like:
```
https://fountain-macro-assistant.vercel.app/shared.html?code=ABC123
```

1. Click the link or copy it to your browser
2. The page will automatically switch to the import tab with the code filled in
3. Click **"Import"**
4. Follow the import steps above

---

## Import from Extension Backup

If you've backed up your macros using the cloud sync feature:

### Step 1: Log In

1. Open the extension **Options** page
2. In the **"Cloud Sync"** section, click **"Log In / Sign Up"**
3. Log in with your account credentials

### Step 2: Restore from Backup

1. In the **"Cloud Sync"** section, click **"Restore from Cloud"**
2. Confirm the restore when prompted (this will replace your current macros)
3. Your macros will be restored from your account backup
4. Reload the extension popup to see the restored macros

---

## Import Tips and Best Practices

### Organizing Imported Macros

1. **Use Folders**: Before importing, create folders in the extension to organize macros
2. **Review Before Import**: Check your JSON file structure before importing
3. **Backup First**: Export your current macros before importing new ones (Options → Export as JSON)

### Handling Duplicates

- The extension automatically skips macros with duplicate shortcuts
- If you want to replace existing macros, delete them first, then import
- Imported macros with new shortcuts will always be added

### File Format Validation

Make sure your JSON file:
- Is valid JSON (use a JSON validator if unsure)
- Contains an array of objects (starts with `[` and ends with `]`)
- Each macro has at least `id`, `shortcut`, and `expansion` fields
- Uses proper JSON syntax (quotes around strings, proper commas)

### Example Import Scenarios

#### Scenario 1: Importing Work Macros

1. Create a folder called "Work" in the extension
2. Note the folder ID (you can find this by exporting macros)
3. Add `"folderId": "your-work-folder-id"` to each macro in your JSON
4. Import the JSON file
5. All macros will be organized in the "Work" folder

#### Scenario 2: Sharing Macros with Team

1. Export your macros (Options → Export as JSON)
2. Share the JSON file with your team
3. Team members import the file using the steps above
4. Everyone gets the same macros

#### Scenario 3: Migrating from Another Tool

1. Export macros from your previous tool (if it supports export)
2. Convert the export format to match Fountain's JSON structure
3. Import the converted file
4. Review and organize the imported macros

---

## Troubleshooting

### Import Button Not Working

- **Solution**: Make sure you're using a valid JSON file. Check the file format in a text editor.

### "No valid macros found" Error

- **Cause**: The JSON file doesn't match the expected format
- **Solution**: 
  - Ensure the file is valid JSON
  - Check that it's an array (starts with `[`)
  - Verify each macro has `id`, `shortcut`, and `expansion` fields

### Macros Not Appearing After Import

- **Cause**: Duplicate shortcuts (existing macros with same shortcuts)
- **Solution**: The import succeeded, but duplicates were skipped. Check the import confirmation message.

### Import Shared Macros Button Opens Website

- **Expected Behavior**: This is normal! The button opens the shared macros library where you can browse and import macros.

### Large Files Taking Too Long

- **Solution**: 
  - Break large imports into smaller batches
  - Remove unnecessary data from the JSON file
  - Import in smaller groups (50-100 macros at a time)

### JSON Syntax Errors

Common JSON errors:
- Missing commas between objects
- Trailing commas (not allowed in JSON)
- Unquoted strings
- Invalid escape characters

**Fix**: Use a JSON validator (like jsonlint.com) to find and fix errors.

---

## Advanced: Creating Import Files

### Basic Macro

```json
{
  "id": "1",
  "shortcut": "/email",
  "expansion": "contact@example.com"
}
```

### Macro with Aliases

```json
{
  "id": "2",
  "shortcut": "/phone",
  "expansion": "+1-555-0123",
  "aliases": ["/tel", "/mobile"]
}
```

### Macro with Tags

```json
{
  "id": "3",
  "shortcut": "/address",
  "expansion": "123 Main St, City, State 12345",
  "tags": ["contact", "work", "office"]
}
```

### Macro with Conditional Expansion

```json
{
  "id": "4",
  "shortcut": "/greeting",
  "expansion": "Hello!",
  "conditions": {
    "expansions": [
      {
        "expansion": "Good morning!",
        "timeRange": {
          "start": 0,
          "end": 12
        }
      },
      {
        "expansion": "Good afternoon!",
        "timeRange": {
          "start": 12,
          "end": 18
        }
      }
    ]
  }
}
```

### Full Example File

```json
[
  {
    "id": "macro-1",
    "shortcut": "/email",
    "expansion": "your.email@example.com",
    "aliases": ["/e", "/mail"],
    "tags": ["email", "contact"],
    "caseSensitive": false
  },
  {
    "id": "macro-2",
    "shortcut": "/signature",
    "expansion": "Best regards,\nJohn Doe\nSenior Developer",
    "tags": ["signature", "email"]
  },
  {
    "id": "macro-3",
    "shortcut": "/date",
    "expansion": "{date}",
    "tags": ["date", "variable"]
  }
]
```

---

## Quick Reference

| Import Method | Best For | Steps |
|--------------|----------|-------|
| JSON File | Bulk imports, backups, migrating | Options → Import Macros → Select file |
| Shared Library | Community macros, sharing | Website → Browse → Import → Options → Import Shared |
| Share Code | Quick sharing between users | Website → Import by Code → Enter code |
| Cloud Backup | Restoring your own macros | Options → Cloud Sync → Restore from Cloud |

---

## Need Help?

- Visit the [Forum](https://fountain-macro-assistant.vercel.app/forum.html) for community support
- Check the [User Guide](https://fountain-macro-assistant.vercel.app/#guide) for more information
- Review the [FAQ](https://fountain-macro-assistant.vercel.app/#faq) section

---

**Last Updated**: January 2025
**Extension Version**: 1.0.1







