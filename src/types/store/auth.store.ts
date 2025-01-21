/**
 * @fileoverview Authentication store type definitions
 * @module types/store/auth
 * @description
 * Type definitions for the authentication store using Zustand.
 * Includes state and actions for managing authentication.
 */

import { User } from '@supabase/supabase-js';
import { Profile } from '../auth.types';

/**
 * Authentication store state
 * 
 * @interface AuthState
 * @property {User | null} user - Current Supabase auth user
 * @property {Profile | null} profile - Current user's profile
 * @property {boolean} loading - Authentication loading state
 * @property {Error | null} error - Authentication error if any
 */
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Authentication store actions
 * 
 * @interface AuthActions
 * @property {Function} setUser - Set the current user
 * @property {Function} setProfile - Set the current profile
 * @property {Function} setLoading - Set the loading state
 * @property {Function} setError - Set the error state
 * @property {Function} reset - Reset the store to initial state
 */
export interface AuthActions {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

/**
 * Complete authentication store type
 * Combines state and actions
 * 
 * @type {AuthStore}
 */
export type AuthStore = AuthState & AuthActions; 