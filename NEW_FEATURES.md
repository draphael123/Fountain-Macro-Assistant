# Fountain - Macro Assistant - New Features Guide

## ✨ All 5 Features Implemented!

### 1. 🔤 Macro Variables/Placeholders

You can now use dynamic variables in your macro expansions!

**Available Variables:**
- `{date}` - Current date (e.g., "12/29/2024")
- `{time}` - Current time (e.g., "3:45:30 PM")
- `{datetime}` - Date and time (e.g., "12/29/2024, 3:45:30 PM")
- `{year}` - Current year (e.g., "2024")
- `{month}` - Current month (01-12)
- `{day}` - Current day (01-31)
- `{hour}` - Current hour (00-23)
- `{minute}` - Current minute (00-59)
- `{second}` - Current second (00-59)
- `{timestamp}` - Unix timestamp
- `{clipboard}` - Paste clipboard content
- `{newline}` - Insert a line break
- `{tab}` - Insert a tab character

**Example:**
- Shortcut: `/signature`
- Expansion: `Best regards,\n{name}\nSent on {date} at {time}`

When expanded, it will insert:
```
Best regards,
{name}
Sent on 12/29/2024 at 3:45:30 PM
```

### 2. ↩️ Undo Functionality

**Features:**
- Automatic undo notification appears after each expansion
- Click "Undo" button in the notification to revert
- Or press **Ctrl+Z** (Cmd+Z on Mac) to undo
- Undo works within the same input field
- History stores last 10 expansions

**How to Use:**
1. Type a macro and it expands
2. A notification appears in bottom-right corner
3. Click "Undo" or press Ctrl+Z to revert
4. Notification auto-hides after 5 seconds

### 3. 📊 Usage Statistics

**Tracked Data:**
- **Usage Count** - How many times each macro has been used
- **Last Used** - When the macro was last expanded
- **Display** - Shows usage badge and "Last used" date in macro list

**Visual Indicators:**
- Usage count badge appears next to macro shortcut
- "Last used: X days ago" shown below expansion text
- Statistics update automatically when macros are used

**Sorting Options:**
- Sort by Usage - See most-used macros first
- Sort by Recent - See recently used macros first
- Sort by Name - Alphabetical order
- Sort by Created - Newest macros first

### 4. 🔍 Enhanced Search & Sorting

**Search Features:**
- Search by shortcut name
- Search by expansion text
- Real-time filtering as you type
- Works with folder filtering

**Sort Options:**
- **Sort by Name** - Alphabetical by shortcut
- **Sort by Usage** - Most-used macros first
- **Recently Used** - Recently expanded macros first
- **Date Created** - Newest macros first

**How to Use:**
1. Type in search box to filter
2. Select sort option from dropdown
3. Combine with folder filter for precise results

### 5. ⌨️ Keyboard Shortcuts

**Available Shortcuts:**
- **Ctrl/Cmd + N** - Create new macro
- **Ctrl/Cmd + F** - Focus search box
- **Ctrl/Cmd + /** - Show keyboard shortcuts help
- **Escape** - Close any open modal
- **Ctrl/Cmd + Z** - Undo last expansion (in input fields)

**How to Use:**
- Press the key combination while the popup is open
- Shortcuts work globally in the extension popup
- Ctrl+Z works in any input field on web pages

## 🎯 Quick Start Examples

### Example 1: Email Template with Variables
```
Shortcut: /email
Expansion: Hi {name},\n\nThis email was sent on {date} at {time}.\n\nBest regards,\n{yourname}
```

### Example 2: Date-Stamped Note
```
Shortcut: /note
Expansion: Note from {date} {time}:\n{newline}
```

### Example 3: Clipboard Integration
```
Shortcut: /paste
Expansion: Here's what I copied: {clipboard}
```

## 📝 Tips & Tricks

1. **Combine Variables**: Use multiple variables in one expansion
   - Example: `Meeting on {date} at {time}`

2. **Formatting**: Use {newline} and {tab} for better formatting
   - Example: `Line 1{newline}Line 2{newline}{tab}Indented`

3. **Track Usage**: Sort by "Usage" to find your most valuable macros

4. **Quick Undo**: If you expand by mistake, just press Ctrl+Z

5. **Search Efficiently**: Use search + sort to quickly find macros

## 🔄 What's Changed

### Content Script (content.js)
- Added variable processing function
- Added undo history tracking
- Added usage statistics tracking
- Added undo notification system
- Added Ctrl+Z handler

### Popup (popup.js)
- Added usage statistics loading
- Added sorting functionality
- Added keyboard shortcuts
- Enhanced macro rendering with stats
- Added date formatting

### UI (popup.html & popup.css)
- Added sort dropdown
- Added variable help text
- Added usage badges styling
- Added macro metadata display
- Enhanced search controls layout

## 🚀 Next Steps

1. **Reload the extension** in `chrome://extensions/`
2. **Try creating a macro** with variables like `{date}` or `{time}`
3. **Expand a macro** and see the undo notification
4. **Check usage stats** by sorting by "Usage"
5. **Use keyboard shortcuts** - Press Ctrl+N to create a macro!

Enjoy your enhanced extension! 🎉

