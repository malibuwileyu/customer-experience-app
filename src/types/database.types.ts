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
      /**
       * Teams table
       * Stores team information
       */
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          lead_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          lead_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * Team members table
       * Stores team member information
       */
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: 'admin' | 'agent' | 'team_lead' | 'customer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: 'admin' | 'agent' | 'team_lead' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: 'admin' | 'agent' | 'team_lead' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * Categories table
       * Stores category information
       */
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * Tickets table
       * Stores customer support tickets and their details
       */
      tickets: {
        /**
         * Row type for reading data
         */
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          created_by: string;
          assigned_to: string | null;
          category: string | null;
          tags: string[] | null;
          attachments: string[] | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        /**
         * Insert type with required and optional fields
         */
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          created_by: string;
          assigned_to?: string | null;
          category?: string | null;
          tags?: string[] | null;
          attachments?: string[] | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        /**
         * Update type with all fields optional
         */
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          created_by?: string;
          assigned_to?: string | null;
          category?: string | null;
          tags?: string[] | null;
          attachments?: string[] | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * Ticket comments table
       * Stores comments and attachments for tickets
       */
      ticket_comments: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          content: string;
          attachments: Json[] | null;
          is_internal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          content: string;
          attachments?: Json[] | null;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          content?: string;
          attachments?: Json[] | null;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * Ticket status history table
       * Tracks status changes for audit purposes
       */
      ticket_status_history: {
        Row: {
          id: string;
          ticket_id: string;
          changed_by: string;
          old_status: 'open' | 'in_progress' | 'resolved' | 'closed' | null;
          new_status: 'open' | 'in_progress' | 'resolved' | 'closed';
          changed_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          changed_by: string;
          old_status?: 'open' | 'in_progress' | 'resolved' | 'closed' | null;
          new_status: 'open' | 'in_progress' | 'resolved' | 'closed';
          changed_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          changed_by?: string;
          old_status?: 'open' | 'in_progress' | 'resolved' | 'closed' | null;
          new_status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          changed_at?: string;
        };
      };
      /**
       * Ticket assignment history table
       * Tracks assignment changes for audit purposes
       */
      ticket_assignment_history: {
        Row: {
          id: string;
          ticket_id: string;
          assigned_by: string;
          old_assignee: string | null;
          new_assignee: string | null;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          assigned_by: string;
          old_assignee?: string | null;
          new_assignee?: string | null;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          assigned_by?: string;
          old_assignee?: string | null;
          new_assignee?: string | null;
          assigned_at?: string;
        };
      };
      /**
       * SLA configuration table
       * Defines response and resolution time targets
       */
      sla_configs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          response_time_hours: number;
          resolution_time_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          response_time_hours: number;
          resolution_time_hours: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          response_time_hours?: number;
          resolution_time_hours?: number;
          created_at?: string;
          updated_at?: string;
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
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed';
      ticket_priority: 'low' | 'medium' | 'high' | 'urgent';
    };
  };
}; 