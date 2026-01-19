// Centralized logging system for the habit tracker app

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs
  private storageKey = 'habit_tracker_logs';

  constructor() {
    this.loadLogs();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
        // Keep only last maxLogs
        if (this.logs.length > this.maxLogs) {
          this.logs = this.logs.slice(-this.maxLogs);
        }
      }
    } catch (error) {
      console.error('Error loading logs from storage:', error);
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      // If storage is full, remove oldest logs
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.logs = this.logs.slice(-Math.floor(this.maxLogs / 2));
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (e) {
          console.error('Failed to save logs after cleanup:', e);
        }
      }
    }
  }

  private log(level: LogLevel, category: string, message: string, data?: any, userId?: string) {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      userId,
    };

    this.logs.push(entry);

    // Keep only last maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save to localStorage
    this.saveLogs();

    // Also log to console with appropriate level
    const consoleMessage = `[${level}] [${category}] ${message}`;
    const consoleData = data ? { data, userId } : userId ? { userId } : undefined;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(consoleMessage, consoleData || '');
        break;
      case LogLevel.INFO:
        console.info(consoleMessage, consoleData || '');
        break;
      case LogLevel.WARN:
        console.warn(consoleMessage, consoleData || '');
        break;
      case LogLevel.ERROR:
        console.error(consoleMessage, consoleData || '');
        break;
    }

    return entry;
  }

  debug(category: string, message: string, data?: any, userId?: string) {
    return this.log(LogLevel.DEBUG, category, message, data, userId);
  }

  info(category: string, message: string, data?: any, userId?: string) {
    return this.log(LogLevel.INFO, category, message, data, userId);
  }

  warn(category: string, message: string, data?: any, userId?: string) {
    return this.log(LogLevel.WARN, category, message, data, userId);
  }

  error(category: string, message: string, data?: any, userId?: string) {
    return this.log(LogLevel.ERROR, category, message, data, userId);
  }

  // Get all logs
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get recent logs
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
    this.info('SYSTEM', 'All logs cleared');
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Export logs as text
  exportLogsAsText(): string {
    return this.logs.map(log => {
      const date = new Date(log.timestamp).toLocaleString();
      const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      const userStr = log.userId ? ` | User: ${log.userId.substring(0, 8)}...` : '';
      return `[${date}] [${log.level}] [${log.category}] ${log.message}${dataStr}${userStr}`;
    }).join('\n');
  }

  // Get log statistics
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
      },
      byCategory: {} as Record<string, number>,
      oldest: this.logs[0]?.timestamp || null,
      newest: this.logs[this.logs.length - 1]?.timestamp || null,
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper function to get logs location info
export function getLogsLocation(): string {
  return `
📋 Logs are stored in:
1. Browser Console - Real-time logs (F12 → Console tab)
2. Browser LocalStorage - Persistent logs (key: 'habit_tracker_logs')
   - Access: localStorage.getItem('habit_tracker_logs')
   - Location: Browser DevTools → Application → Local Storage → Your domain
3. Export available via logger.exportLogs() or logger.exportLogsAsText()

💡 To view logs:
- Open browser console (F12)
- Run: logger.getAllLogs()
- Or: logger.getRecentLogs(50)
- Or: logger.getLogsByCategory('TRANSCRIPTION')
  `;
}

