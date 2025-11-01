# 🧩 Phase 2: UI/UX Enhancements

**Type:** Enhancement  
**Priority:** Medium  
**Owner:** Front-end Lead  
**Labels:** `enhancement`, `ui/ux`, `v1.2.0`

---

## 🎯 Goal

Improve interactivity and developer ergonomics of the Atlas Debug Suite logger panel while maintaining zero-dependency philosophy.

We target three main improvements that enhance usability without architectural changes.

---

## 📋 Requirements

### 1. Auto-collapse behavior

- [ ] Collapse panel after **5s of user inactivity**
- [ ] Restore on:
  - [ ] New log entry
  - [ ] User mouse move
  - [ ] Keyboard event
- [ ] Smooth transition (`transform`, not `display:none`)
- [ ] Optional pulse highlight when re-appearing

**Technical Notes:**
- Use `requestAnimationFrame` for smooth animations
- Track last activity timestamp
- Reset timer on any user interaction

---

### 2. Quick Tag Filter

- [ ] Clicking on a tag (`<span class="log-badge">`) applies filter — show only logs with that tag
- [ ] Clicking again clears the filter
- [ ] Should coexist with level filters (INFO/SUCCESS/WARNING/ERROR/ALL)
- [ ] Keep logic inside the `GPTLogger` class (no global listeners)

**Technical Notes:**
- Add `data-tag` attribute to badge elements
- Store active tag filter in class state
- Combine tag filter with level filters in `applyFilters()` method

---

### 3. Persistent Log Storage

- [ ] Save last **50 entries** in `localStorage`
- [ ] Restore on initialization
- [ ] Implement debounce to avoid excessive writes (300ms)
- [ ] Add optional `persist: true` flag in config/constructor

**Technical Notes:**
- Use `localStorage.setItem('atlas-debug-logs', JSON.stringify(...))`
- Load in `init()` or constructor
- Debounce using `setTimeout` or requestIdleCallback
- Handle localStorage quota exceeded errors gracefully

---

## 🧠 Non-Functional Constraints

- ✅ **Zero external dependencies** — pure TypeScript + CSS
- ✅ Maintain full compatibility with existing API:
  ```typescript
  gptLog(message, level?, tags?)
  gptLogInfo(message, tags?)
  gptLogSuccess(message, tags?)
  gptLogWarn(message, tags?)
  gptLogError(message, tags?)
  gptLogClear()
  gptLogExport()
  ```
- ✅ Respect existing structure (`src/gptLogger.ts` only)
- ✅ Code must remain readable and documented (inline doc comments in English)
- ✅ Maintain TypeScript strict mode compatibility
- ✅ Keep bundle size impact minimal (< 2KB gzipped)

---

## 📈 Acceptance Criteria

- [ ] Demo (`/demo`) reflects new interactions
- [ ] Panel auto-collapses and re-expands smoothly (60fps)
- [ ] Tag filters toggle correctly
- [ ] Logs persist across page reloads (test with 50+ entries)
- [ ] Lighthouse performance impact < 1%
- [ ] All existing tests pass (if we add tests)
- [ ] Works on mobile devices (touch events)
- [ ] No console errors or warnings

**Testing Checklist:**
- [ ] Test auto-collapse with multiple log entries
- [ ] Test tag filter with different combinations
- [ ] Test persistence with browser refresh
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS Safari, Chrome Mobile)

---

## 🚀 Optional Stretch Goals

If time permits, consider:

- [ ] "Share Logs" button → copy base64-encoded JSON to clipboard
  - Format: `atlas://logs?data=<base64>`
  - Or: `?logs=<base64>` URL param
  
- [ ] `?logs=` URL param → auto-import logs on load
  - Parse from URL hash or query string
  - Validate JSON structure
  - Merge with existing logs or replace
  
- [ ] CSS theme toggle (`data-theme="dark|light"`)
  - Toggle button in header
  - Save preference to localStorage
  - Smooth transition between themes

---

## 📦 Deliverables

- [ ] Updated `src/gptLogger.ts`
- [ ] CSS adjustments in `src/style.css`
- [ ] Updated `demo/index.html` with new demo buttons if needed
- [ ] Short update in `README.md` describing new behaviors
- [ ] Update `CHANGELOG.md` with new features

---

## 📝 Implementation Notes

### File Structure
```
src/
  ├── gptLogger.ts  ← Main implementation
  └── style.css     ← Styling updates

demo/
  └── index.html    ← Demo updates

README.md           ← Documentation
CHANGELOG.md        ← Version history
```

### Key Methods to Modify/Add

```typescript
class GPTLogger {
  // New properties
  private activeTagFilter: string | null = null;
  private lastActivityTime: number = Date.now();
  private autoCollapseTimer: number | null = null;
  private persistEnabled: boolean = true;
  
  // Methods to add/modify
  private initAutoCollapse(): void { }
  private handleActivity(): void { }
  private toggleTagFilter(tag: string): void { }
  private saveLogsToStorage(): void { }
  private loadLogsFromStorage(): void { }
  private debouncedSave(): void { }
}
```

---

## 🔗 Related

- Phase 1: Initial release (v1.0.0) ✅
- Current: Filter system (v1.1.0) ✅
- This: UI/UX enhancements (v1.2.0) 🎯

---

## 📚 References

- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Web Performance Best Practices](https://web.dev/performance/)

---

**Estimated Time:** 4-6 hours  
**Status:** 🔴 Not Started

---

## 💬 Discussion

Use this issue for questions, clarifications, or suggestions.

