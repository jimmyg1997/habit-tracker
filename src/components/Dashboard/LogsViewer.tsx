import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Filter, X, Search } from 'lucide-react';
import { logger, LogLevel, type LogEntry, getLogsLocation } from '../../utils/logger';

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(logger.getStats());
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    loadLogs();
    // Refresh logs every 2 seconds
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedLevel, selectedCategory, searchTerm]);

  const loadLogs = () => {
    const allLogs = logger.getAllLogs();
    setLogs(allLogs);
    setStats(logger.getStats());
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.category.toLowerCase().includes(term) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(term))
      );
    }

    setFilteredLogs(filtered);
  };

  const categories = Array.from(new Set(logs.map(log => log.category))).sort();

  const exportLogs = () => {
    const text = logger.exportLogsAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportLogsJSON = () => {
    const json = logger.exportLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
      logger.clearLogs();
      loadLogs();
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'text-gray-500 dark:text-gray-400';
      case LogLevel.INFO:
        return 'text-blue-600 dark:text-blue-400';
      case LogLevel.WARN:
        return 'text-yellow-600 dark:text-yellow-400';
      case LogLevel.ERROR:
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getLevelBg = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'bg-gray-100 dark:bg-gray-800';
      case LogLevel.INFO:
        return 'bg-blue-50 dark:bg-blue-900/20';
      case LogLevel.WARN:
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case LogLevel.ERROR:
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-white dark:bg-slate-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Application Logs</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLocation(!showLocation)}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Show logs location"
          >
            📍 Location
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export TXT
          </button>
          <button
            onClick={exportLogsJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {showLocation && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {getLogsLocation()}
          </pre>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Logs</div>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.byLevel[LogLevel.INFO]}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Info</div>
        </div>
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.byLevel[LogLevel.WARN]}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Warnings</div>
        </div>
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.byLevel[LogLevel.ERROR]}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Errors</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'ALL')}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        >
          <option value="ALL">All Levels</option>
          <option value={LogLevel.DEBUG}>Debug</option>
          <option value={LogLevel.INFO}>Info</option>
          <option value={LogLevel.WARN}>Warn</option>
          <option value={LogLevel.ERROR}>Error</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        >
          <option value="ALL">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No logs found
          </div>
        ) : (
          filteredLogs.slice().reverse().map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border ${getLevelBg(log.level)} border-gray-200 dark:border-slate-600`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${getLevelColor(log.level)}`}>
                      [{log.level}]
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {log.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white mb-1">
                    {log.message}
                  </div>
                  {log.data && (
                    <details className="mt-1">
                      <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                        View Data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  {log.userId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      User: {log.userId.substring(0, 8)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

