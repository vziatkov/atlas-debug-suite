# Changelog

All notable changes to Atlas Debug Suite will be documented in this file.

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

