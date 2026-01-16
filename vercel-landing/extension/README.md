# 💧 Fountain - Macro Assistant v3.0

> Type faster with smart text expansion! Create shortcuts that magically expand into longer text.

![Version](https://img.shields.io/badge/version-3.0.0-purple?style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=googlechrome)

## ✨ What's New in v3.0

🎨 **Vibrant Colorful UI** - Beautiful gradients, rainbow animations, and multiple accent colors  
🎯 **Regex Patterns** - Dynamic triggers with capture groups  
💻 **JavaScript Snippets** - Execute code in your expansions  
🔢 **Smart Counters** - Auto-incrementing numbers for invoices, tickets, etc.  
🎲 **Random Selection** - Randomly pick from options  
💬 **Auto-Suggest Popup** - Suggestions appear as you type  
⭐ **Favorites System** - Star your most-used macros  
📊 **Usage Heatmap** - Visualize your activity  
🎮 **Onboarding Tour** - Guided intro for new users  
📦 **Snippet Packages** - Pre-built template collections  

---

## 🚀 Features

### Core Expansion
- Type shortcuts → get expanded text instantly
- Works in any text field on any website
- Supports multi-line expansions
- Undo with Ctrl+Z

### 🔤 Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{date}` | Current date | `1/8/2026` |
| `{date:FORMAT}` | Formatted date | `{date:YYYY-MM-DD}` → `2026-01-08` |
| `{time}` | Current time | `3:45:00 PM` |
| `{datetime}` | Date and time | `1/8/2026, 3:45:00 PM` |
| `{cursor}` | Position cursor here | `Hello {cursor} World` |
| `{input:Label}` | Prompt user for input | `{input:Your Name}` |
| `{clipboard}` | Paste clipboard content | `{clipboard}` |
| `{counter:name}` | Auto-increment counter | `{counter:invoice}` → `0001`, `0002`... |
| `{random:a\|b\|c}` | Random selection | `{random:Hi\|Hello\|Hey}` |
| `{macro:/other}` | Nest another macro | `{macro:/sig}` |
| `{js:code}` | Execute JavaScript | `{js:Date.now()}` |

### 📅 Date Format Tokens

| Token | Output | Example |
|-------|--------|---------|
| `YYYY` | Full year | `2026` |
| `YY` | 2-digit year | `26` |
| `MMMM` | Full month | `January` |
| `MMM` | Short month | `Jan` |
| `MM` | Month (2-digit) | `01` |
| `DDDD` | Full weekday | `Thursday` |
| `DDD` | Short weekday | `Thu` |
| `DD` | Day (2-digit) | `08` |
| `HH` | Hour (24h) | `15` |
| `hh` | Hour (12h) | `03` |
| `mm` | Minutes | `45` |
| `ss` | Seconds | `30` |
| `A`/`a` | AM/PM | `PM`/`pm` |

### 🎯 Regex Patterns

Create dynamic triggers with regular expressions:

```
Pattern:  /issue-(\d+)
Expansion: https://github.com/org/repo/issues/$1

Type: /issue-123
Result: https://github.com/org/repo/issues/123
```

Capture groups:
- `$1`, `$2`, etc. - Captured groups
- `$&` - Entire match

### 💻 JavaScript Snippets

Execute JavaScript code inline:

```
{js:new Date().toLocaleDateString('en-US', {weekday: 'long'})}
→ "Thursday"

{js:Math.floor(Math.random() * 100)}
→ Random number 0-99

{js:['morning', 'afternoon', 'evening'][Math.floor(new Date().getHours()/8)]}
→ Time-based greeting word
```

### ⚡ Conditional Expansions

Different text based on time or day:
- Morning greeting (0-12)
- Afternoon greeting (12-18)
- Evening greeting (18-24)
- Weekday vs Weekend variations

### 🌐 Domain Filtering

- **Whitelist**: Only expand on specific sites
- **Blacklist**: Never expand on specific sites

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+M` | Open Fountain popup |
| `Ctrl+Shift+N` | Quick create new macro |
| `Ctrl+Z` | Undo last expansion |
| `Space` / `Enter` | Trigger expansion |

---

## 📦 Installation

1. Clone or download this repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `fountain-macro-assistant-extension` folder
6. Pin the extension for easy access!

---

## 📁 Project Structure

```
fountain-macro-assistant-extension/
├── manifest.json      # Extension manifest
├── popup.html/css/js  # Main popup UI
├── options.html/css/js # Settings page
├── content.js         # Text expansion engine
├── background.js      # Service worker
├── icons/             # Extension icons
└── README.md          # This file
```

---

## 💡 Tips

### Naming Shortcuts
- Start with `/`, `.`, `@`, or `#` to avoid conflicts
- Keep them short but memorable
- Use consistent prefixes: `/email`, `/sig`, `/addr`

### Organization
- Create folders for categories (Work, Personal)
- Star frequently used macros
- Add tags for easy filtering

### Power User
- Combine variables: `{input:Name} on {date}`
- Nest macros for complex templates
- Use regex for dynamic patterns
- Test expansions in the sandbox before saving

---

## 🎨 Theme

Toggle between dark and light mode using the theme button in the header.

---

## 📊 Analytics

Track your productivity in the Dashboard:
- Total expansions
- Characters saved
- Time saved estimation
- Activity heatmap
- Top used macros

---

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and pull requests.

---

## 📜 License

MIT License - feel free to use and modify!

---

Made with 💜 by the Fountain team



