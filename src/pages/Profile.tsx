import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../lib/db';
import { Moon, Sun, Download, LogOut, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Dashboard/Header';
import HabitManager from '../components/Profile/HabitManager';
import { exportToExcel } from '../utils/export';

interface ProfileProps {
  updateTheme: (theme: 'light' | 'dark') => void;
}

export default function Profile({ updateTheme }: ProfileProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [isDark, setIsDark] = useState(user?.theme_preference === 'dark');

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setIsDark(user.theme_preference === 'dark');
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
    await updateTheme(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const handleDisplayNameUpdate = async () => {
    if (!user) return;
    const success = await updateUser(user.id, { display_name: displayName });
    if (success) {
      toast.success('Display name updated');
    } else {
      toast.error('Failed to update display name');
    }
  };

  const handleExport = async () => {
    if (!user) return;
    try {
      await exportToExcel(user.id);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (!user) return null;

  const completedCount = 0; // Would need to calculate from completions
  const completionPercentage = 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        user={user}
        selectedDate={new Date()}
        completionPercentage={completionPercentage}
        completedCount={completedCount}
        totalCount={0}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile Settings</h1>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{user.email}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Your name"
                  />
                  <button
                    onClick={handleDisplayNameUpdate}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark mode
                  </p>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className="p-3 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-warning" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Habit Management */}
          <HabitManager />

          {/* Data Export */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Export
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Export all your habit tracking data to Excel
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          {/* Sign Out */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


