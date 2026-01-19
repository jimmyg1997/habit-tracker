import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { User, BarChart3, Settings, Flame, Home, LogOut, FileText } from 'lucide-react';
import type { User as UserType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import LogsViewer from './LogsViewer';
import XPLevelInfo from './XPLevelInfo';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  user: UserType | null;
  selectedDate: Date;
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
  viewMode?: 'daily' | 'weekly';
}

export default function Header({
  user,
  selectedDate,
  completionPercentage,
  completedCount,
  totalCount,
  viewMode = 'daily',
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isHome = location.pathname === '/';
  const [showLogs, setShowLogs] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200/50 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {!isHome && (
              <Link
                to="/"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </Link>
            )}
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
              Habit Tracker
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              {user && (
                <>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-warning" />
                    <span className="font-semibold">{user.current_streak} day streak</span>
                  </div>
                  <XPLevelInfo user={user} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completedCount}/{totalCount} completed
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  ({viewMode === 'weekly' ? 'week' : 'today'})
                </span>
              </div>
              <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <button
                onClick={() => setShowLogs(true)}
                className="hidden md:block p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                title="View Logs"
              >
                <FileText className="w-5 h-5" />
              </button>
              <Link
                to="/analytics"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                title="Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </Link>
              <Link
                to="/profile"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                title="Profile"
              >
                <Settings className="w-5 h-5" />
              </Link>
              {user && (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.display_name || user.email}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Logs Viewer Modal */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogs(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LogsViewer />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

