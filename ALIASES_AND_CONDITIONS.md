# Fountain - Macro Assistant - Aliases & Conditional Expansions Guide

## 🔗 Macro Aliases

### What are Aliases?

Aliases allow you to create multiple shortcuts that trigger the same expansion. This is useful when you want different ways to access the same content.

### How to Use Aliases

1. **Create or Edit a Macro**
2. **In the "Aliases" field**, enter comma-separated shortcuts
   - Example: `/e, /mail, /email`
3. **Save the macro**

### Example

**Macro:**
- Shortcut: `/email`
- Aliases: `/e, /mail`
- Expansion: `your.email@example.com`

**Result:**
- Typing `/email` + Space → expands
- Typing `/e` + Space → expands
- Typing `/mail` + Space → expands

All three shortcuts trigger the same expansion!

### Visual Indicators

- Macros with aliases show a 🔗 icon next to the shortcut
- Hover to see the aliases

## ⚡ Conditional Expansions

### What are Conditional Expansions?

Conditional expansions allow you to have different text based on:
- **Time of day** (e.g., morning vs. evening greetings)
- **Day of week** (e.g., weekday vs. weekend)
- **Combined conditions** (e.g., weekday mornings)

### How to Set Up Conditions

1. **Create or Edit a Macro**
2. **Check "Enable conditional expansion"**
3. **Set up conditions:**

#### Time Range
- **Time Start**: Hour when condition starts (0-23)
- **Time End**: Hour when condition ends (0-23)
- Example: Start: 9, End: 17 = 9 AM to 5 PM

#### Weekdays Only
- Check this to only expand on Monday-Friday

#### Conditional Expansions
- Click "+ Add Conditional" to add specific expansions
- Each conditional can have:
  - Different expansion text
  - Time range
  - Specific day
  - Weekday-only option

### Examples

#### Example 1: Time-Based Greeting

**Macro:**
- Shortcut: `/greeting`
- Default Expansion: `Hello!`
- Conditional: 
  - Time: 0-12 (morning)
  - Expansion: `Good morning!`
- Conditional:
  - Time: 12-18 (afternoon)
  - Expansion: `Good afternoon!`
- Conditional:
  - Time: 18-24 (evening)
  - Expansion: `Good evening!`

**Result:**
- 10 AM: Expands to "Good morning!"
- 3 PM: Expands to "Good afternoon!"
- 8 PM: Expands to "Good evening!"

#### Example 2: Weekday vs Weekend

**Macro:**
- Shortcut: `/status`
- Default Expansion: `Available`
- Conditional:
  - Weekdays only: checked
  - Expansion: `In the office`
- Conditional:
  - Weekday only: unchecked (weekends)
  - Expansion: `Out of office`

**Result:**
- Monday-Friday: "In the office"
- Saturday-Sunday: "Out of office"

#### Example 3: Complex Condition

**Macro:**
- Shortcut: `/meeting`
- Default Expansion: `Let's schedule a meeting`
- Conditional:
  - Time: 9-12
  - Weekdays only: checked
  - Expansion: `Morning meeting available`
- Conditional:
  - Time: 13-17
  - Weekdays only: checked
  - Expansion: `Afternoon meeting available`

**Result:**
- Weekday 10 AM: "Morning meeting available"
- Weekday 3 PM: "Afternoon meeting available"
- Weekend: "Let's schedule a meeting"

### How Conditions Work

1. **Conditions are checked in order**
2. **First matching condition wins**
3. **If no conditions match, default expansion is used**
4. **Time ranges can span midnight** (e.g., 22:00 to 06:00)

### Visual Indicators

- Macros with conditions show a ⚡ icon next to the shortcut
- Hover to see condition details

## 🎯 Best Practices

### Aliases
- Use short, memorable aliases
- Keep aliases consistent (e.g., `/e` for email, `/p` for phone)
- Don't create too many aliases (2-3 is usually enough)

### Conditional Expansions
- Start simple with time-based conditions
- Test conditions at different times/days
- Use default expansion as fallback
- Combine conditions for complex scenarios

## 💡 Tips

1. **Aliases are case-sensitive** if the macro is case-sensitive
2. **Conditions are evaluated in real-time** when you type
3. **Time is based on your system clock**
4. **Day 0 = Sunday, Day 6 = Saturday**
5. **You can combine aliases and conditions** in the same macro

## 🔍 Troubleshooting

**Alias not working?**
- Check for typos in alias
- Verify alias isn't conflicting with another macro
- Make sure case sensitivity matches

**Condition not working?**
- Check system time is correct
- Verify time range (0-23 format)
- Ensure conditions are properly saved
- Check that condition logic matches your intent

## 📝 Examples to Try

### Quick Start Examples

1. **Email with aliases:**
   - Shortcut: `/email`
   - Aliases: `/e, /mail`
   - Expansion: `your.email@example.com`

2. **Time-based greeting:**
   - Shortcut: `/hi`
   - Default: `Hello`
   - Conditional (0-12): `Good morning`
   - Conditional (12-18): `Good afternoon`
   - Conditional (18-24): `Good evening`

3. **Weekday status:**
   - Shortcut: `/status`
   - Default: `Available`
   - Conditional (weekdays): `In office`
   - Conditional (weekends): `Out of office`

Enjoy your powerful macro system! 🚀

