import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    // Load remember me preference from localStorage
    const saved = localStorage.getItem('habit-tracker-remember-me');
    return saved === 'true';
  });
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let timeoutFired = false;
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      timeoutFired = true;
      setLoading(false);
      toast.error('Request timed out. Please check your connection and try again.');
    }, 10000); // 10 second timeout

    try {
      if (isLogin) {
        // Save remember me preference
        localStorage.setItem('habit-tracker-remember-me', rememberMe.toString());
        if (rememberMe) {
          localStorage.setItem('habit-tracker-email', email);
        } else {
          localStorage.removeItem('habit-tracker-email');
        }
        
        await signIn(email, password, rememberMe);
        if (!timeoutFired) {
          clearTimeout(timeoutId);
          toast.success('Welcome back!');
        }
      } else {
        if (!displayName.trim()) {
          clearTimeout(timeoutId);
          toast.error('Please enter a display name');
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName);
        if (!timeoutFired) {
          clearTimeout(timeoutId);
          toast.success('Account created! Welcome!');
        }
      }
    } catch (error: any) {
      if (!timeoutFired) {
        clearTimeout(timeoutId);
        const errorMessage = error.message || 'An error occurred';
        toast.error(errorMessage);
        console.error('Auth error:', error);
      }
    } finally {
      if (!timeoutFired) {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
  };

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('habit-tracker-email');
    const rememberMeChecked = localStorage.getItem('habit-tracker-remember-me') === 'true';
    if (rememberMeChecked && savedEmail && isLogin) {
      setEmail(savedEmail);
    }
  }, [isLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-success/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Habit Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Build better habits, one day at a time
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-primary"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setDisplayName('');
              }}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

