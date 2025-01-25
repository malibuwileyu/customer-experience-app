/**
 * @fileoverview Authentication type definitions
 * @module types/auth
 * @description
 * Defines types for authentication, user profiles, and protected routes.
 * Integrates with Supabase Auth and custom profile management.
 */

import { User, Session } from '@supabase/supabase-js';

/**
 * Available user roles in the system
 * Determines access levels and permissions
 * 
 * @type {UserRole}
 */
export type UserRole = 'admin' | 'agent' | 'team_lead' | 'customer';

/**
 * Extended user profile information
 * Stored in the profiles table and linked to Supabase auth user
 * 
 * @interface Profile
 * @property {string} id - Primary key
 * @property {string} email - User's email address
 * @property {string} full_name - User's full name
 * @property {UserRole} role - User's role in the system
 * @property {string | null} avatar_url - URL to user's avatar image
 * @property {Record<string, unknown>} preferences - User preferences
 * @property {Record<string, unknown>} metadata - Additional user metadata
 * @property {string} created_at - Profile creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string | null} last_seen_at - Last activity timestamp
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string | null;
}

/**
 * Authentication state
 * Tracks current user, profile, loading state, and errors
 * 
 * @interface AuthState
 * @property {User | null} user - Current Supabase auth user
 * @property {Profile | null} profile - Current user's profile
 * @property {boolean} loading - Authentication loading state
 * @property {Error | null} error - Authentication error if any
 * @property {Session | null} session - Current Supabase session
 */
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  session: Session | null;
}

/**
 * Authentication context type
 * Extends AuthState with authentication methods
 * 
 * @interface AuthContextType
 * @extends {AuthState}
 * @property {Function} signIn - Email/password sign in
 * @property {Function} signUp - New user registration
 * @property {Function} signOut - User sign out
 * @property {Function} updateProfile - Update user profile
 * @property {Function} resetPassword - Initiate password reset
 * @property {Function} updatePassword - Change user password
 */
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; role?: UserRole }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

/**
 * Props for the ProtectedRoute component
 * Used to restrict access based on authentication and roles
 * 
 * @interface ProtectedRouteProps
 * @property {React.ReactNode} children - Child components to render
 * @property {UserRole[]} [requiredRoles] - Roles allowed to access the route
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
} 