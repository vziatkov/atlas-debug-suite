# ⚡ GPT Logger / Atlas Debug Suite

Lightweight **visual logging panel** for browser-based apps and games.  
Perfect for Vite, Svelte, PixiJS or any SPA setup — no console switching, logs stay **on-screen**.

> 🎯 **Atlas Debug Suite** — professional debugging toolkit with tags, export, and beautiful UI

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

**[🎮 Try Live Demo](https://vziatkov.github.io/atlas-debug-suite/)**

---

## 🚀 Features

- 🪶 **Zero dependencies** — just import and go  
- 🖥️ **Floating draggable log panel** — move it anywhere  
- 🌈 **Color-coded levels**: info, success, warning, error  
- 🏷️ **Tag system** — organize logs with clickable badges  
- 🎯 **Smart filtering** — filter by level and tags  
- 📥 **Export to JSON** — save and analyze logs  
- 📋 **Copy to clipboard** — copy visible logs  
- 🔄 **Auto-scroll** — smooth scrolling to new logs  
- 🎨 **Dark/Light themes** — toggle with button or `Ctrl+Shift+T`  
- ⌨️ **Keyboard shortcuts** — power user features  
- 📦 **Collapsible objects** — click to expand JSON  
- 📁 **Log groups** — organize related logs  
- ⏱️ **Timers** — measure performance  
- 🤖 **AI dialog support** — log prompts/responses with latency  
- 📡 **Realtime sync** — sync logs across browser tabs  
- 💻 **Browser console API** — works from DevTools  
- 🎨 **Fully customizable** — CSS variables and themes  
- 📱 **Mobile responsive** — works on all devices  

---

## 📦 Installation

### NPM (coming soon)
```bash
npm install atlas-debug-suite
```

### Manual
Just drop `gptLogger.ts` and styles into your `/src` folder:

```typescript
import './gptLogger';
import { gptLog, gptLogSuccess } from './gptLogger';
```

---

## 🧰 Usage

### Basic
```typescript
import { gptLog, gptLogInfo, gptLogSuccess, gptLogWarn, gptLogError } from './gptLogger';

gptLog('Simple message');
gptLogInfo('Initialization complete');
gptLogSuccess('All systems go');
gptLogWarn('Low memory');
gptLogError('Worker failed');
```

### With Tags
```typescript
gptLog('Shard completed', 'info', ['shard', 'progress']);
gptLogSuccess('New record!', ['game', 'achievement']);
gptLogError('Worker crashed', ['worker', 'error', 'critical']);

// Click on any tag badge to filter by that tag!
```

### Advanced Features
```typescript
// Groups (like console.group)
gptLogGroup('Initialization');
gptLogInfo('Step 1', ['init']);
gptLogSuccess('Step 2', ['init']);
gptLogGroupEnd('Initialization');

// Performance timers
gptTimer('data-load');
// ... async operation ...
gptTimerEnd('data-load'); // Logs duration

// AI dialogs with latency tracking
gptAIDialog(
  'User prompt',
  'AI response',
  1234 // latency in ms
);
```

### From Browser Console
```javascript
gptLog('Hello from console!');
gptLogInfo('Debug info', ['console', 'debug']);
gptLogCopy();    // Copy visible logs (Ctrl+Shift+C)
gptLogExport();  // Export logs as JSON (Ctrl+E)
gptLogClear();   // Clear all logs (Ctrl+L)

// Click tags in the panel to filter!
// Use theme button (🌙) to toggle dark/light mode
```

### Export Logs
```typescript
import { gptLogExport } from './gptLogger';

// Export all logs to JSON file
gptLogExport();

// Or from console:
// gptLogExport()
```

---

## 📊 Export Format

Exported JSON includes:
- All log entries with timestamps
- Tags and levels
- Metadata (userAgent, URL, export time)
- Version info

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-01-14T12:34:56.789Z",
  "totalLogs": 42,
  "tags": ["init", "worker", "game"],
  "logs": [...],
  "metadata": {...}
}
```

---

## ⚙️ Customization

### CSS Variables
Edit `style.css` for colors, sizes, and themes:

```css
#gpt-logger {
  width: 400px;
  max-height: 400px;
  /* Customize colors, borders, shadows */
}
```

### Configuration
Modify `gptLogger.ts`:
- `maxLogs`: Maximum log entries (default: 100)
- Panel position and behavior
- Log format and styling

---

## 🎯 Use Cases

- **Game Development** — track game state, achievements, performance  
- **Web Workers** — monitor worker lifecycle and messages  
- **SPA Debugging** — see state changes without console  
- **Mobile Development** — debug on real devices  
- **Performance Monitoring** — track async operations  
- **Educational Projects** — visualize algorithm steps  

---

## 🔧 API Reference

### Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `gptLog(message, level, tags?)` | Main logging function | `message: any`, `level: 'info' \| 'success' \| 'warning' \| 'error'`, `tags?: string[]` |
| `gptLogInfo(message, tags?)` | Info level | `message: any`, `tags?: string[]` |
| `gptLogSuccess(message, tags?)` | Success level | `message: any`, `tags?: string[]` |
| `gptLogWarn(message, tags?)` | Warning level | `message: any`, `tags?: string[]` |
| `gptLogError(message, tags?)` | Error level | `message: any`, `tags?: string[]` |
| `gptLogGroup(title)` | Start log group | `title: string` |
| `gptLogGroupEnd(title)` | End log group | `title: string` |
| `gptTimer(name)` | Start performance timer | `name: string` |
| `gptTimerEnd(name)` | End timer and log duration | `name: string` |
| `gptAIDialog(prompt, response, latency?)` | Log AI dialog | `prompt: string`, `response: string`, `latency?: number` |
| `gptLogClear()` | Clear all logs | - |
| `gptLogCopy()` | Copy visible logs to clipboard | - |
| `gptLogExport()` | Export logs to JSON | - |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + L` | Clear logs |
| `Ctrl/Cmd + Shift + C` | Copy visible logs |
| `Ctrl/Cmd + E` | Export logs |
| `Ctrl/Cmd + Shift + T` | Toggle theme |

---

## 🌟 Examples

### React/Vue/Svelte
```typescript
import { gptLogSuccess } from './gptLogger';

function MyComponent() {
  useEffect(() => {
    gptLogSuccess('Component mounted', ['react', 'lifecycle']);
  }, []);
}
```

### Game Loop
```typescript
import { gptLog } from './gptLogger';

function gameLoop() {
  gptLog({ fps: 60, entities: 100 }, 'info', ['game', 'performance']);
}
```

### Web Workers
```typescript
import { gptLogInfo, gptLogError } from './gptLogger';

worker.onmessage = (e) => {
  gptLogInfo(`Worker result: ${e.data}`, ['worker', 'result']);
};
```

---

## 📁 Project Structure

```
atlas-debug-suite/
├── src/
│   ├── gptLogger.ts      # Main logger class
│   └── style.css         # Panel styles (import separately)
├── demo/
│   └── index.html        # Live demo
├── package.json
├── README.md
└── LICENSE
```

---

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📜 License

MIT © 2025 [Vitalii Ziatkov](https://github.com/vitaliyziatkov)

Free to use in personal and commercial projects.

---

## 🙏 Credits

Made with ❤️ for developers who love seeing their code come alive right on screen.

**Atlas Debug Suite** — because debugging should be beautiful.

---

> 💡 *Inspired by the need for better debugging in modern web development*


