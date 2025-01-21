/**
 * @fileoverview Authentication context provider and hook
 * @module contexts/AuthContext
 * @description
 * Provides authentication state and methods throughout the application using React Context.
 * Handles user authentication, session management, and auth state changes using Supabase Auth.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError, Session } from '@supabase/supabase-js';

/**
 * Authentication context interface defining available auth state and methods
 * 
 * @interface
 * @property {User | null} user - Current authenticated user or null
 * @property {Session | null} session - Current auth session or null
 * @property {boolean} isLoading - Whether auth operations are in progress
 * @property {Function} login - Email/password login function
 * @property {Function} logout - Logout function
 * @property {Function} register - User registration function
 */
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: { email: string; password: string }) => Promise<{ 
    data: { user: User | null } | null;
    error: AuthError | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component that manages auth state and operations
 * 
 * Features:
 * - Session persistence and restoration
 * - Real-time auth state updates
 * - Login/logout functionality
 * - User registration
 * - Loading state management
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <AppContent />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Authenticates a user with email and password
   * 
   * @async
   * @param {{ email: string; password: string }} credentials - Login credentials
   * @throws {AuthError} When login fails
   */
  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;

      // Update session and user immediately after successful login
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Signs out the current user
   * 
   * @async
   * @throws {AuthError} When logout fails
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear session and user immediately after successful logout
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user with email and password
   * 
   * @async
   * @param {{ email: string; password: string }} credentials - Registration credentials
   * @returns {Promise<{ data: { user: User | null } | null; error: AuthError | null }>}
   *   Registration result with user data or error
   */
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
    session,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication state and methods
 * 
 * @hook
 * @throws {Error} When used outside of AuthProvider
 * @returns {AuthContextType} Auth context value
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, logout } = useAuth();
 *   return user ? (
 *     <div>
 *       <p>Welcome, {user.email}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   ) : null;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 