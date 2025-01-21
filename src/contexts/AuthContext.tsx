import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: { email: string; password: string }) => Promise<{ 
    data: { user: User | null } | null;
    error: AuthError | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('Attempting login with:', {
        url: import.meta.env.VITE_SUPABASE_URL,
        email: credentials.email
      });

      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      console.log('Login response:', {
        success: !!data?.user,
        userId: data?.user?.id,
        error: error?.message,
        status: error?.status
      });

      if (error) throw error;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const register = async (credentials: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.email.split('@')[0], // Default to email username
            role: 'customer' // Default role
          }
        }
      });

      return { data, error };
    } catch (err) {
      console.error('Registration error:', err);
      return {
        data: null,
        error: err instanceof AuthError ? err : new AuthError('Registration failed')
      };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 