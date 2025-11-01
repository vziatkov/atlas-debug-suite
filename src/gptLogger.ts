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
    
    // Делаем панель перетаскиваемой
    this.makeDraggable(header, container);
    
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

  private formatMessage(message: any): string {
    if (typeof message === 'object' && message !== null) {
      try {
        return JSON.stringify(message, null, 2);
      } catch {
        return String(message);
      }
    }
    return String(message);
  }

  private getTimeString(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  log(message: any, level: LogLevel = 'info', tags?: string[]): void {
    if (!this.content) return;

    const formattedMessage = this.formatMessage(message);
    const time = this.getTimeString();
    const timestamp = Date.now();

    // Обрабатываем теги
    if (tags && tags.length > 0) {
      tags.forEach(tag => this.allTags.add(tag));
    }

    const entry: LogEntry = {
      message: formattedMessage,
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
    
    // Добавляем бейджи тегов
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'log-badge';
        badge.textContent = tag;
        badge.title = `Tag: ${tag}`;
        logEntry.appendChild(badge);
      });
    }
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = formattedMessage;
    
    logEntry.appendChild(timeSpan);
    logEntry.appendChild(messageSpan);
    
    this.content.appendChild(logEntry);
    
    // Применяем фильтры к новому элементу
    this.applyFiltersToElement(logEntry, level);
    
    // Автопрокрутка вниз
    this.content.scrollTop = this.content.scrollHeight;
    
    // Также выводим в консоль для удобства
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warning' ? 'warn' : 
                         'log';
    const tagStr = tags && tags.length > 0 ? `[${tags.join(', ')}] ` : '';
    console[consoleMethod](`[GPT Log] ${tagStr}${formattedMessage}`);
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
    const shouldShow = this.visibleLevels.has('all') || this.visibleLevels.has(level);
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
  
  copyVisibleLogs(): void {
    const visibleLogs = this.logs.filter(log => {
      return this.visibleLevels.has('all') || this.visibleLevels.has(log.level);
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
        visibleLevels: Array.from(this.visibleLevels)
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
      version: '1.1.0',
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
    this.log(message, 'info', tags);
  }

  success(message: any, tags?: string[]): void {
    this.log(message, 'success', tags);
  }

  warn(message: any, tags?: string[]): void {
    this.log(message, 'warning', tags);
  }

  error(message: any, tags?: string[]): void {
    this.log(message, 'error', tags);
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

