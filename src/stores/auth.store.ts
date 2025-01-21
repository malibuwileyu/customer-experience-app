/**
 * @fileoverview Authentication state management store
 * @module stores/auth
 * @description
 * Manages global authentication state using Zustand, including user data,
 * profile information, loading states, and error handling. Provides actions
 * for updating auth state throughout the application.
 */

import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { AuthState, Profile } from '../types/auth.types';

/**
 * Authentication store interface extending base auth state
 * 
 * @interface
 * @extends {AuthState}
 * @property {Function} setUser - Updates the current user
 * @property {Function} setProfile - Updates the user's profile
 * @property {Function} setLoading - Updates loading state
 * @property {Function} setError - Updates error state
 * @property {Function} reset - Resets store to initial state
 */
interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

/**
 * Initial authentication state
 * All users start as unauthenticated with loading true
 */
const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
};

/**
 * Authentication store hook using Zustand
 * 
 * Features:
 * - User state management
 * - Profile data management
 * - Loading state handling
 * - Error state management
 * - State reset capability
 * 
 * @example
 * ```tsx
 * function AuthStatus() {
 *   const { user, loading, error } = useAuthStore();
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return user ? (
 *     <div>Welcome, {user.email}</div>
 *   ) : (
 *     <div>Please log in</div>
 *   );
 * }
 * 
 * function AuthActions() {
 *   const { setUser, setError, reset } = useAuthStore();
 * 
 *   const handleLogout = () => {
 *     setUser(null);
 *     reset();
 *   };
 * }
 * ```
 */
export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  /** Updates the authenticated user state */
  setUser: (user: User | null) => set({ user }),
  /** Updates the user's profile information */
  setProfile: (profile: Profile | null) => set({ profile }),
  /** Updates the global loading state */
  setLoading: (loading: boolean) => set({ loading }),
  /** Updates the global error state */
  setError: (error: Error | null) => set({ error }),
  /** Resets the store to its initial state */
  reset: () => set(initialState),
}));
