/**
 * @fileoverview Supabase client configuration and initialization
 * @module lib/supabase
 * @description
 * Configures and exports a strongly-typed Supabase client instance with authentication
 * and request settings. Uses environment variables for configuration and includes
 * type safety through database type definitions.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

/**
 * Required environment variables for Supabase configuration
 * These must be set in the .env file
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Configured Supabase client instance
 * 
 * Features:
 * - Strong typing with Database type
 * - Persistent session management
 * - Automatic token refresh
 * - PKCE auth flow for enhanced security
 * - Custom client info header
 * 
 * @example
 * ```typescript
 * // Querying with type safety
 * const { data, error } = await supabase
 *   .from('users')
 *   .select('*')
 *   .eq('id', userId);
 * 
 * // Authentication
 * const { data: { session }, error } = await supabase.auth.getSession();
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Keep user logged in between page refreshes
    storageKey: 'app-auth', // Key for storing auth data in localStorage
    storage: window.localStorage, // Use localStorage for session persistence
    autoRefreshToken: true, // Automatically refresh auth tokens
    detectSessionInUrl: true, // Handle auth redirects automatically
    flowType: 'pkce', // Use PKCE flow for enhanced security
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'customer-experience-app', // Identify client in requests
    }
  },
});

/**
 * Service client with admin privileges
 * Used for operations that need to bypass RLS policies
 * 
 * Features:
 * - Strong typing with Database type
 * - No session persistence
 * - No token refresh
 * - Service role key for admin access
 * 
 * @example
 * ```typescript
 * // Admin operations bypassing RLS
 * const { data, error } = await serviceClient
 *   .from('users')
 *   .select('*');
 * ```
 */
export const serviceClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'customer-experience-app',
    }
  },
}); 