# Changelog

All notable changes to Fountain - Macro Assistant will be documented in this file.

## [1.0.1] - 2025-01-XX

### Fixed
- **Critical Bug Fix**: Fixed expansion not working when typing shortcuts
  - Rewrote expansion logic to be synchronous for instant expansion
  - Fixed async function execution issues
  - Expansion now happens immediately when pressing Space or Enter after a shortcut

### Improved
- Better error handling in expansion logic
- Improved performance (synchronous expansion for common case)
- Only uses async processing when clipboard variable is needed

### Changed
- Updated website download links to point to GitHub repository
- Installation guide updated to mention cloning option

## [1.0.0] - Initial Release

### Features
- Text expansion with custom shortcuts
- Macro aliases (multiple shortcuts for same expansion)
- Conditional expansions (time-based, day-based)
- Dynamic variables ({date}, {time}, {clipboard}, etc.)
- Folder organization
- Usage statistics
- Undo functionality
- Dark mode support
- Enhanced search with fuzzy matching
- Tag system
- Multiple export formats (JSON, CSV, plain text)
- Context menu integration







