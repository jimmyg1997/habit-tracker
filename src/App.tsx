import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';
import FlowerBackground from './components/FlowerBackground';

function App() {
  const { user, loading, updateTheme } = useAuth();

  useEffect(() => {
    if (user?.theme_preference) {
      document.documentElement.classList.toggle('dark', user.theme_preference === 'dark');
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
      {user && <FlowerBackground />}
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/analytics"
          element={user ? <Analytics /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile updateTheme={updateTheme} /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

