/**
 * @fileoverview Supabase client configuration and initialization
 * @module lib/supabase
 * @description
 * Configures and exports strongly-typed Supabase client instances with authentication
 * and request settings. Uses environment variables for configuration and includes
 * type safety through database type definitions.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

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
 * Regular Supabase client instance for client-side operations
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

/**
 * Service-level Supabase client instance for privileged operations
 * This client bypasses RLS and should only be used for service-level operations
 */
export const supabaseService = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}); 