/**
 * @fileoverview Database type definitions for Supabase
 * @module types/database
 * @description
 * Type definitions for the Supabase database schema.
 * Includes table definitions, views, functions, and enums.
 * Generated from the database schema using the Supabase CLI.
 */

/**
 * JSON value type for flexible data storage
 * Supports nested objects, arrays, and primitive types
 * 
 * @type {Json}
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Complete database schema type definition
 * 
 * @type {Database}
 * @property {Object} public - Public schema containing all database objects
 */
export type Database = {
  public: {
    /**
     * Database table definitions
     */
    Tables: {
      /**
       * User profiles table
       * Stores extended user information and preferences
       */
      profiles: {
        /**
         * Row type for reading data
         * @property {string} id - Primary key
         * @property {string} user_id - Foreign key to auth.users
         * @property {string | null} full_name - User's full name
         * @property {'admin' | 'agent' | 'team_lead' | 'customer'} role - User's role
         * @property {string | null} avatar_url - URL to user's avatar image
         * @property {Json} preferences - User preferences as JSON
         * @property {Json} metadata - Additional metadata as JSON
         * @property {string} created_at - Creation timestamp
         * @property {string} updated_at - Last update timestamp
         * @property {string | null} last_seen_at - Last activity timestamp
         */
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          role: 'admin' | 'agent' | 'team_lead' | 'customer';
          avatar_url: string | null;
          preferences: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
          last_seen_at: string | null;
        };
        /**
         * Insert type with optional fields
         * Required: user_id
         * Optional: all other fields
         */
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          role?: 'admin' | 'agent' | 'team_lead' | 'customer';
          avatar_url?: string | null;
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          last_seen_at?: string | null;
        };
        /**
         * Update type with all fields optional
         */
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          role?: 'admin' | 'agent' | 'team_lead' | 'customer';
          avatar_url?: string | null;
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          last_seen_at?: string | null;
        };
      };
    };
    /**
     * Database view definitions
     * Currently no views defined
     */
    Views: {
      [_ in never]: never;
    };
    /**
     * Database function definitions
     * Currently no functions defined
     */
    Functions: {
      [_ in never]: never;
    };
    /**
     * Database enum definitions
     * @property {user_role} - Available user roles
     */
    Enums: {
      user_role: 'admin' | 'agent' | 'team_lead' | 'customer';
    };
  };
}; 