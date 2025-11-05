/**
 * Atlas Debug Suite by Vitalii Ziatkov
 * 
 * Полноценная система отладки с визуальной панелью, тегами и экспортом
 * 
 * Использование:
 *   gptLog('Простое сообщение')
 *   gptLog('Информация', 'info', ['tag1', 'tag2'])
 *   gptLog('Успех!', 'success', ['achievement'])
 *   gptLog('Предупреждение', 'warning', ['warning'])
 *   gptLog('Ошибка!', 'error', ['error', 'critical'])
 *   gptLog({ x: 10, y: 20 }, 'info', ['data']) // Автоматически форматирует объекты
 *   
 *   gptLogInfo('Инфо', ['tag'])
 *   gptLogSuccess('Успех', ['tag'])
 *   gptLogWarn('Предупреждение', ['tag'])
 *   gptLogError('Ошибка', ['tag'])
 *   
 *   gptLogClear() // Очистить логи
 *   gptLogExport() // Экспортировать логи в JSON
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error';

interface LogEntry {
  message: string;
  level: LogLevel;
  time: string;
  timestamp: number;
  tags?: string[];
}

class GPTLogger {
  private container: HTMLElement | null = null;
  private content: HTMLElement | null = null;
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private isExpanded = true;
  private allTags = new Set<string>();
  private visibleLevels: Set<LogLevel | 'all'> = new Set(['all']);
  private filterButtons: Map<string, HTMLButtonElement> = new Map();
  private theme: 'dark' | 'light' = 'dark';
  private activeGroups: Map<string, HTMLElement> = new Map();
  private timers: Map<string, number> = new Map();
  private activeTagFilter: string | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private realtimeEnabled: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Создаем контейнер
    const container = document.createElement('div');
    container.id = 'gpt-logger';
    container.className = 'expanded';
    
    // Создаем заголовок
    const header = document.createElement('div');
    header.id = 'gpt-logger-header';
    
    const title = document.createElement('div');
    title.id = 'gpt-logger-title';
    title.textContent = 'GPT Debug Log';
    
    const controls = document.createElement('div');
    controls.id = 'gpt-logger-controls';
    
    const clearBtn = document.createElement('button');
    clearBtn.id = 'gpt-logger-btn';
    clearBtn.textContent = 'Clear';
    clearBtn.onclick = () => this.clear();
    
    const copyBtn = document.createElement('button');
    copyBtn.id = 'gpt-logger-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.title = 'Copy visible logs to clipboard';
    copyBtn.onclick = () => this.copyVisibleLogs();
    
    const themeBtn = document.createElement('button');
    themeBtn.id = 'gpt-logger-btn';
    themeBtn.textContent = '🌙';
    themeBtn.title = 'Toggle theme';
    themeBtn.onclick = () => this.toggleTheme();
    
    const exportBtn = document.createElement('button');
    exportBtn.id = 'gpt-logger-btn';
    exportBtn.textContent = 'Export';
    exportBtn.title = 'Export logs as JSON';
    exportBtn.onclick = () => this.exportLogs();
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'gpt-logger-btn';
    toggleBtn.textContent = '−';
    toggleBtn.onclick = () => this.toggle();
    
    controls.appendChild(clearBtn);
    controls.appendChild(copyBtn);
    controls.appendChild(themeBtn);
    controls.appendChild(exportBtn);
    controls.appendChild(toggleBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    // Создаем фильтры
    const filters = document.createElement('div');
    filters.id = 'gpt-logger-filters';
    
    const levels: (LogLevel | 'all')[] = ['all', 'info', 'success', 'warning', 'error'];
    levels.forEach(level => {
      const btn = document.createElement('button');
      btn.className = 'gpt-logger-filter-btn';
      btn.textContent = level.toUpperCase();
      btn.dataset.level = level;
      btn.onclick = () => this.toggleFilter(level);
      if (level === 'all') {
        btn.classList.add('active');
      }
      filters.appendChild(btn);
      this.filterButtons.set(level, btn);
    });
    
    // Создаем контент
    const content = document.createElement('div');
    content.id = 'gpt-logger-content';
    
    container.appendChild(header);
    container.appendChild(filters);
    container.appendChild(content);
    
    document.body.appendChild(container);
    
    this.container = container;
    this.content = content;
    
    // Загружаем состояние из localStorage
    this.loadState();
    
    // Применяем состояние панели
    if (!this.isExpanded) {
      container.classList.add('collapsed');
      container.classList.remove('expanded');
      const toggleBtn = container.querySelector('#gpt-logger-controls button:last-child') as HTMLButtonElement;
      if (toggleBtn) toggleBtn.textContent = '+';
    }
    
    // Применяем тему
    this.applyTheme();
    
    // Делаем панель перетаскиваемой
    this.makeDraggable(header, container);
    
    // Инициализируем клавиатурные хоткеи
    this.initKeyboardShortcuts();
    
    // Инициализируем realtime режим (BroadcastChannel)
    this.initRealtime();
    
    // Первое сообщение
    this.log('GPT Logger initialized', 'success');
  }

  private makeDraggable(handle: HTMLElement, element: HTMLElement): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = element.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      
      element.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      // Ограничиваем перемещение в пределах экрана
      const maxX = window.innerWidth - element.offsetWidth;
      const maxY = window.innerHeight - element.offsetHeight;
      
      element.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
      element.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        element.style.transition = 'all 0.3s ease';
      }
    });
  }

  private formatMessage(message: any): { text: string; isObject: boolean; json?: string } {
    if (typeof message === 'object' && message !== null) {
      try {
        const json = JSON.stringify(message, null, 2);
        return { 
          text: Object.keys(message).length === 0 ? '{}' : `{${Object.keys(message).length} keys}`,
          isObject: true,
          json: json
        };
      } catch {
        return { text: String(message), isObject: false };
      }
    }
    return { text: String(message), isObject: false };
  }

  private getTimeString(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  log(message: any, level: LogLevel = 'info', tags?: string[], skipBroadcast: boolean = false): void {
    if (!this.content) return;

    const formatted = this.formatMessage(message);
    const time = this.getTimeString();
    const timestamp = Date.now();

    // Обрабатываем теги
    if (tags && tags.length > 0) {
      tags.forEach(tag => this.allTags.add(tag));
    }

    const entry: LogEntry = {
      message: formatted.isObject ? formatted.json! : formatted.text,
      level,
      time,
      timestamp,
      tags: tags || []
    };

    this.logs.push(entry);
    
    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Создаем элемент лога
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${level}`;
    logEntry.dataset.level = level;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = `[${time}]`;
    
      // Добавляем бейджи тегов (кликабельные для фильтрации)
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'log-badge';
        badge.textContent = tag;
        badge.title = `Click to filter by tag: ${tag}`;
        badge.style.cursor = 'pointer';
        badge.onclick = (e) => {
          e.stopPropagation();
          this.toggleTagFilter(tag);
        };
        logEntry.appendChild(badge);
      });
    }
    
    // Создаём контейнер для сообщения
    const messageContainer = document.createElement('span');
    
    if (formatted.isObject && formatted.json) {
      // Свёртываемый объект
      const toggleBtn = document.createElement('span');
      toggleBtn.className = 'log-toggle';
      toggleBtn.textContent = formatted.text;
      toggleBtn.style.cursor = 'pointer';
      toggleBtn.style.marginRight = '4px';
      toggleBtn.style.fontWeight = 'bold';
      
      const expandedContent = document.createElement('pre');
      expandedContent.className = 'log-expanded';
      expandedContent.textContent = formatted.json;
      expandedContent.style.display = 'none';
      expandedContent.style.margin = '4px 0 0 20px';
      expandedContent.style.padding = '8px';
      expandedContent.style.background = 'rgba(0, 0, 0, 0.3)';
      expandedContent.style.borderRadius = '4px';
      expandedContent.style.fontSize = '11px';
      expandedContent.style.overflowX = 'auto';
      
      let isExpanded = false;
      toggleBtn.onclick = () => {
        isExpanded = !isExpanded;
        expandedContent.style.display = isExpanded ? 'block' : 'none';
        toggleBtn.textContent = isExpanded ? '▼ ' + formatted.text : '▶ ' + formatted.text;
      };
      
      messageContainer.appendChild(toggleBtn);
      messageContainer.appendChild(expandedContent);
    } else {
      messageContainer.textContent = formatted.text;
    }
    
    logEntry.appendChild(timeSpan);
    logEntry.appendChild(messageContainer);
    
    // Добавляем в активную группу или в основной контент
    const activeGroup = this.activeGroups.size > 0 
      ? Array.from(this.activeGroups.values())[this.activeGroups.size - 1]
      : null;
    
    if (activeGroup) {
      activeGroup.appendChild(logEntry);
    } else {
      this.content.appendChild(logEntry);
    }
    
    // Применяем фильтры к новому элементу
    this.applyFiltersToElement(logEntry, level);
    
    // Улучшенная автопрокрутка вниз
    if (this.content.scrollHeight - this.content.scrollTop < this.content.clientHeight + 100) {
      logEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Также выводим в консоль для удобства
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warning' ? 'warn' : 
                         'log';
    const tagStr = tags && tags.length > 0 ? `[${tags.join(', ')}] ` : '';
    console[consoleMethod](`[GPT Log] ${tagStr}${formatted.isObject ? formatted.json! : formatted.text}`);
    
    // Отправляем в другие вкладки (realtime), только если это не сообщение из другой вкладки
    if (!skipBroadcast) {
      this.broadcastLog(message, level, tags);
    }
  }

  toggleFilter(level: LogLevel | 'all'): void {
    if (level === 'all') {
      // Toggle all
      if (this.visibleLevels.has('all')) {
        this.visibleLevels.clear();
        this.filterButtons.get('all')?.classList.remove('active');
      } else {
        this.visibleLevels.clear();
        this.visibleLevels.add('all');
        ['info', 'success', 'warning', 'error'].forEach(l => {
          this.visibleLevels.add(l as LogLevel);
          this.filterButtons.get(l)?.classList.add('active');
        });
        this.filterButtons.get('all')?.classList.add('active');
      }
    } else {
      // Toggle specific level
      if (this.visibleLevels.has('all')) {
        // Если был "all", убираем его и добавляем все кроме выбранного
        this.visibleLevels.delete('all');
        this.filterButtons.get('all')?.classList.remove('active');
        ['info', 'success', 'warning', 'error'].forEach(l => {
          if (l !== level) {
            this.visibleLevels.add(l as LogLevel);
            this.filterButtons.get(l)?.classList.add('active');
          }
        });
      } else {
        if (this.visibleLevels.has(level)) {
          this.visibleLevels.delete(level);
          this.filterButtons.get(level)?.classList.remove('active');
        } else {
          this.visibleLevels.add(level);
          this.filterButtons.get(level)?.classList.add('active');
        }
        
        // Если выбраны все уровни, активируем "all"
        if (this.visibleLevels.size === 4) {
          this.visibleLevels.clear();
          this.visibleLevels.add('all');
          this.filterButtons.get('all')?.classList.add('active');
          ['info', 'success', 'warning', 'error'].forEach(l => {
            this.filterButtons.get(l)?.classList.remove('active');
          });
        }
      }
    }
    
    this.saveState();
    this.applyFilters();
  }
  
  private applyFilters(): void {
    if (!this.content) return;
    
    const entries = this.content.querySelectorAll('.log-entry');
    entries.forEach(entry => {
      const level = entry.getAttribute('data-level') as LogLevel;
      this.applyFiltersToElement(entry as HTMLElement, level);
    });
  }
  
  private applyFiltersToElement(element: HTMLElement, level: LogLevel): void {
    // Проверяем фильтр по уровню
    const levelMatch = this.visibleLevels.has('all') || this.visibleLevels.has(level);
    
    // Проверяем фильтр по тегу
    let tagMatch = true;
    if (this.activeTagFilter) {
      const badges = element.querySelectorAll('.log-badge');
      tagMatch = false;
      badges.forEach(badge => {
        if (badge.textContent === this.activeTagFilter) {
          tagMatch = true;
        }
      });
    }
    
    const shouldShow = levelMatch && tagMatch;
    
    if (shouldShow) {
      element.style.display = '';
      element.style.opacity = '0';
      requestAnimationFrame(() => {
        element.style.transition = 'opacity 0.2s ease';
        element.style.opacity = '1';
      });
    } else {
      element.style.display = 'none';
    }
  }
  
  toggleTagFilter(tag: string): void {
    if (this.activeTagFilter === tag) {
      this.activeTagFilter = null;
      this.log(`Tag filter cleared`, 'info');
    } else {
      this.activeTagFilter = tag;
      this.log(`Filtering by tag: ${tag}`, 'info');
    }
    this.applyFilters();
  }
  
  // Группировка логов
  startGroup(title: string): void {
    if (!this.content) return;
    
    const groupContainer = document.createElement('div');
    groupContainer.className = 'log-group';
    groupContainer.dataset.groupTitle = title;
    
    const groupHeader = document.createElement('div');
    groupHeader.className = 'log-group-header';
    groupHeader.textContent = `▼ ${title}`;
    groupHeader.style.cssText = `
      padding: 4px 8px;
      background: rgba(100, 200, 255, 0.1);
      border-left: 3px solid #64c8ff;
      cursor: pointer;
      font-weight: 600;
      margin-top: 4px;
    `;
    
    const groupContent = document.createElement('div');
    groupContent.className = 'log-group-content';
    groupContent.style.cssText = `
      margin-left: 12px;
      border-left: 2px solid rgba(100, 200, 255, 0.2);
      padding-left: 8px;
    `;
    
    let isCollapsed = false;
    groupHeader.onclick = () => {
      isCollapsed = !isCollapsed;
      groupContent.style.display = isCollapsed ? 'none' : 'block';
      groupHeader.textContent = (isCollapsed ? '▶' : '▼') + ' ' + title;
    };
    
    groupContainer.appendChild(groupHeader);
    groupContainer.appendChild(groupContent);
    this.content.appendChild(groupContainer);
    
    this.activeGroups.set(title, groupContent);
  }
  
  endGroup(title: string): void {
    this.activeGroups.delete(title);
  }
  
  // Таймеры
  timer(name: string): void {
    this.timers.set(name, performance.now());
    this.log(`⏱️ Timer "${name}" started`, 'info', ['timer', 'start']);
  }
  
  timerEnd(name: string): void {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = (performance.now() - startTime).toFixed(2);
      this.timers.delete(name);
      this.log(`⏱️ Timer "${name}": ${duration}ms`, 'success', ['timer', 'end']);
    } else {
      this.log(`⚠️ Timer "${name}" not found`, 'warning', ['timer', 'error']);
    }
  }
  
  // AI диалоги с latency
  aiDialog(prompt: string, response: string, latency?: number): void {
    const latencyMs = latency !== undefined ? latency : 0;
    const latencyStr = latencyMs > 0 ? ` (${latencyMs}ms)` : '';
    
    // Группа для AI диалога
    this.startGroup(`🤖 AI Dialog${latencyStr}`);
    
    this.log(`💬 Prompt: ${prompt}`, 'info', ['ai', 'prompt']);
    this.log(`💭 Response: ${response}`, 'success', ['ai', 'response']);
    
    if (latencyMs > 0) {
      const latencyLevel = latencyMs < 1000 ? 'success' : latencyMs < 3000 ? 'warning' : 'error';
      this.log(`⚡ Latency: ${latencyMs}ms`, latencyLevel, ['ai', 'latency']);
    }
    
    this.endGroup(`🤖 AI Dialog${latencyStr}`);
  }
  
  copyVisibleLogs(): void {
    const visibleLogs = this.logs.filter(log => {
      // Проверяем уровень
      const levelMatch = this.visibleLevels.has('all') || this.visibleLevels.has(log.level);
      
      // Проверяем тег
      let tagMatch = true;
      if (this.activeTagFilter) {
        tagMatch = !!(log.tags && log.tags.includes(this.activeTagFilter));
      }
      
      return levelMatch && tagMatch;
    });
    
    const text = visibleLogs.map(log => {
      const tagStr = log.tags && log.tags.length > 0 ? ` [${log.tags.join(', ')}]` : '';
      return `[${log.time}] [${log.level.toUpperCase()}]${tagStr} ${log.message}`;
    }).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      this.log('📋 Visible logs copied to clipboard', 'success');
    }).catch(() => {
      this.log('❌ Failed to copy logs', 'error');
    });
  }
  
  private saveState(): void {
    try {
      const state = {
        expanded: this.isExpanded,
        visibleLevels: Array.from(this.visibleLevels),
        theme: this.theme
      };
      localStorage.setItem('atlas-debug-suite-state', JSON.stringify(state));
    } catch (e) {
      // Игнорируем ошибки localStorage
    }
  }
  
  private loadState(): void {
    try {
      const saved = localStorage.getItem('atlas-debug-suite-state');
      if (saved) {
        const state = JSON.parse(saved);
        this.isExpanded = state.expanded !== false;
        this.theme = state.theme || 'dark';
        if (state.visibleLevels) {
          this.visibleLevels = new Set(state.visibleLevels);
          // Обновляем UI кнопок
          this.filterButtons.forEach((btn, level) => {
            if (this.visibleLevels.has(level as LogLevel | 'all')) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
          // Применяем фильтры после загрузки состояния
          setTimeout(() => this.applyFilters(), 0);
        }
      }
    } catch (e) {
      // Игнорируем ошибки localStorage
    }
  }
  
  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveState();
  }
  
  private applyTheme(): void {
    if (!this.container) return;
    
    this.container.setAttribute('data-theme', this.theme);
    
    // Обновляем кнопку темы
    const themeBtn = this.container.querySelector('#gpt-logger-controls button:nth-child(3)') as HTMLButtonElement;
    if (themeBtn) {
      themeBtn.textContent = this.theme === 'dark' ? '🌙' : '☀️';
    }
  }
  
  private initKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Проверяем что не в input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl+L или Cmd+L - Clear
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        this.clear();
      }
      
      // Ctrl+Shift+C или Cmd+Shift+C - Copy
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.copyVisibleLogs();
      }
      
      // Ctrl+E или Cmd+E - Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.exportLogs();
      }
      
      // Ctrl+T или Cmd+T - Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 't' && e.shiftKey) {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
  
  private initRealtime(): void {
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('atlas-debug-suite');
        this.realtimeEnabled = true;
        
        // Слушаем сообщения от других вкладок
        this.broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'log') {
            const { message, level, tags } = event.data;
            // skipBroadcast = true, чтобы не создавать цикл
            this.log(message, level, tags, true);
          }
        };
        
        this.log('📡 Realtime mode enabled (BroadcastChannel)', 'success', ['realtime']);
      }
    } catch (e) {
      // BroadcastChannel не поддерживается
    }
  }
  
  // Отправка логов в другие вкладки
  private broadcastLog(message: any, level: LogLevel, tags?: string[]): void {
    if (this.realtimeEnabled && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'log',
          message: typeof message === 'object' ? JSON.stringify(message) : String(message),
          level,
          tags: tags || []
        });
      } catch (e) {
        // Игнорируем ошибки
      }
    }
  }

  clear(): void {
    if (!this.content) return;
    
    this.logs = [];
    this.content.innerHTML = '';
    this.log('Logs cleared', 'info');
  }

  toggle(): void {
    if (!this.container) return;
    
    this.isExpanded = !this.isExpanded;
    const toggleBtn = this.container.querySelector('#gpt-logger-controls button:last-child') as HTMLButtonElement;
    
    if (this.isExpanded) {
      this.container.classList.add('expanded');
      this.container.classList.remove('collapsed');
      toggleBtn.textContent = '−';
    } else {
      this.container.classList.add('collapsed');
      this.container.classList.remove('expanded');
      toggleBtn.textContent = '+';
    }
    
    this.saveState();
  }

  exportLogs(): void {
    const exportData = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      totalLogs: this.logs.length,
      tags: Array.from(this.allTags),
      logs: this.logs,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      }
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas-debug-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    this.log('📥 Logs exported successfully', 'success');
    console.log('📊 Exported logs:', exportData);
  }

  // Удобные методы
  info(message: any, tags?: string[]): void {
    this.log(message, 'info', tags, false);
  }

  success(message: any, tags?: string[]): void {
    this.log(message, 'success', tags, false);
  }

  warn(message: any, tags?: string[]): void {
    this.log(message, 'warning', tags, false);
  }

  error(message: any, tags?: string[]): void {
    this.log(message, 'error', tags, false);
  }
}

// Создаем глобальный экземпляр
const gptLogger = new GPTLogger();

// Экспортируем удобные функции
export const gptLog = (message: any, level: LogLevel = 'info', tags?: string[]) => {
  gptLogger.log(message, level, tags);
};

export const gptLogInfo = (message: any, tags?: string[]) => gptLogger.info(message, tags);
export const gptLogSuccess = (message: any, tags?: string[]) => gptLogger.success(message, tags);
export const gptLogWarn = (message: any, tags?: string[]) => gptLogger.warn(message, tags);
export const gptLogError = (message: any, tags?: string[]) => gptLogger.error(message, tags);
export const gptLogClear = () => gptLogger.clear();
export const gptLogExport = () => gptLogger.exportLogs();
export const gptLogCopy = () => gptLogger.copyVisibleLogs();
export const gptLogGroup = (title: string) => gptLogger.startGroup(title);
export const gptLogGroupEnd = (title: string) => gptLogger.endGroup(title);
export const gptTimer = (name: string) => gptLogger.timer(name);
export const gptTimerEnd = (name: string) => gptLogger.timerEnd(name);
export const gptAIDialog = (prompt: string, response: string, latency?: number) => gptLogger.aiDialog(prompt, response, latency);

// Также добавляем в window для использования из консоли
declare global {
  interface Window {
    gptLog: typeof gptLog;
    gptLogInfo: typeof gptLogInfo;
    gptLogSuccess: typeof gptLogSuccess;
    gptLogWarn: typeof gptLogWarn;
    gptLogError: typeof gptLogError;
    gptLogClear: typeof gptLogClear;
    gptLogExport: typeof gptLogExport;
    gptLogCopy: typeof gptLogCopy;
    gptLogGroup: typeof gptLogGroup;
    gptLogGroupEnd: typeof gptLogGroupEnd;
    gptTimer: typeof gptTimer;
    gptTimerEnd: typeof gptTimerEnd;
    gptAIDialog: typeof gptAIDialog;
  }
}

window.gptLog = gptLog;
window.gptLogInfo = gptLogInfo;
window.gptLogSuccess = gptLogSuccess;
window.gptLogWarn = gptLogWarn;
window.gptLogError = gptLogError;
window.gptLogClear = gptLogClear;
window.gptLogExport = gptLogExport;
window.gptLogCopy = gptLogCopy;
window.gptLogGroup = gptLogGroup;
window.gptLogGroupEnd = gptLogGroupEnd;
window.gptTimer = gptTimer;
window.gptTimerEnd = gptTimerEnd;
window.gptAIDialog = gptAIDialog;

