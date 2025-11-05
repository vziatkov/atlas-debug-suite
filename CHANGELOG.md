# Changelog

All notable changes to Atlas Debug Suite will be documented in this file.

## [1.2.0] - 2025-01-14

### ✨ Added
- **Dark/Light theme toggle** - Switch themes with button or `Ctrl+Shift+T`
- **Keyboard shortcuts** - Power user features:
  - `Ctrl+L` - Clear logs
  - `Ctrl+Shift+C` - Copy visible logs
  - `Ctrl+E` - Export logs
  - `Ctrl+Shift+T` - Toggle theme
- **Collapsible objects** - Click to expand/collapse JSON objects
- **Tag filtering** - Click on any tag badge to filter logs by that tag
- **Log groups** - Organize related logs with `gptLogGroup()` / `gptLogGroupEnd()`
- **Performance timers** - Measure execution time with `gptTimer()` / `gptTimerEnd()`
- **AI dialog support** - Log AI prompts/responses with latency using `gptAIDialog()`
- **Realtime sync** - Automatically sync logs across browser tabs using BroadcastChannel
- **Improved auto-scroll** - Smooth scrolling with `scrollIntoView`

### 🔧 Improved
- Better object formatting - Shows key count for collapsed objects
- Enhanced filtering - Combines level and tag filters
- Copy function - Now respects active filters (level + tag)

### 🎨 UI/UX
- Smooth fade animations for filtered content
- Better visual feedback for interactive elements
- Theme persistence in localStorage

---

## [1.1.0] - 2025-01-14

### ✨ Added
- **Filter system** - Filter logs by level (ALL, INFO, SUCCESS, WARNING, ERROR)
- **LocalStorage persistence** - Filter states and panel expand/collapse state are saved
- **Copy to clipboard** - Copy visible (filtered) logs to clipboard with `gptLogCopy()`
- **Fade animations** - Smooth fade-in animations when showing/hiding filtered logs
- **Color-coded filter buttons** - Each filter button has its own color matching log level

### 🔧 Improved
- Better filter UX - Smart toggle behavior for "ALL" vs individual levels
- Visual feedback - Active filters are highlighted with matching colors
- Performance - Efficient filtering even with 100+ logs

### 📝 Documentation
- Updated README with new features
- Added filter examples in demo

---

## [1.0.0] - 2025-01-14

### 🎉 Initial Release
- Visual logging panel
- Tag system with badges
- Export logs to JSON
- Draggable panel
- Mobile responsive
- Zero dependencies

