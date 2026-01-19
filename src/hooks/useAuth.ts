import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUser, updateUser } from '../lib/db';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Create user object from session
  function createUserFromSession(sessionUser: any): User {
    return {
      id: sessionUser.id,
      email: sessionUser.email!,
      display_name: sessionUser.user_metadata?.display_name || null,
      avatar_url: null,
      theme_preference: 'light',
      created_at: new Date().toISOString(),
      current_streak: 0,
      longest_streak: 0,
      total_xp: 0,
      current_level: 1,
    };
  }

  useEffect(() => {
    let mounted = true;

    // Get initial session - SIMPLE AND FAST
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        setLoading(false);
        return;
      }

      setSession(session);
      
      if (session?.user) {
        // IMMEDIATELY create user from session (don't wait for database)
        const tempUser = createUserFromSession(session.user);
        setUser(tempUser);
        setLoading(false); // Stop loading immediately
        
        // Then try to load real data from database in background
        getUser(session.user.id, 1).then((dbUser) => {
          if (mounted && dbUser) {
            setUser(dbUser); // Update with real data if found
          }
        }).catch(() => {
          // Silently fail - we already have temp user
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      if (session?.user) {
        const tempUser = createUserFromSession(session.user);
        setUser(tempUser);
        setLoading(false);
        
        // Load real data in background
        getUser(session.user.id, 1).then((dbUser) => {
          if (mounted && dbUser) {
            setUser(dbUser);
          }
        }).catch(() => {
          // Silently fail
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadUser(userId: string) {
    const userData = await getUser(userId, 1);
    if (userData) {
      setUser(userData);
    }
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create temp user immediately
      const tempUser = createUserFromSession(data.user);
      setUser(tempUser);
      
      // Wait a moment for trigger, then try to get real data
      setTimeout(async () => {
        const dbUser = await getUser(data.user.id, 2);
        if (dbUser) {
          setUser(dbUser);
          if (displayName && dbUser.display_name !== displayName) {
            await updateUser(data.user.id, { display_name: displayName });
            const updated = await getUser(data.user.id, 1);
            if (updated) setUser(updated);
          }
        }
      }, 1000);
    }

    return { user: data.user, error };
  }

  async function signIn(email: string, password: string, rememberMe: boolean = true) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    if (data.user) {
      // Create temp user immediately
      const tempUser = createUserFromSession(data.user);
      setUser(tempUser);
      
      // Load real data in background
      getUser(data.user.id, 1).then((dbUser) => {
        if (dbUser) {
          setUser(dbUser);
        }
      }).catch(() => {
        // Silently fail
      });
    }

    return { user: data.user, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  async function updateTheme(theme: 'light' | 'dark') {
    if (!user) return;
    const success = await updateUser(user.id, { theme_preference: theme });
    if (success) {
      setUser({ ...user, theme_preference: theme });
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateTheme,
    loadUser,
  };
}
