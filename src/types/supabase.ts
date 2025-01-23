export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: string
          title: string
          description: string
          status: "open" | "in_progress" | "resolved" | "closed"
          priority: "low" | "medium" | "high" | "urgent"
          created_at: string
          updated_at: string
          created_by: string
          assigned_to: string | null
          team_id: string | null
          custom_fields: Json | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          created_at?: string
          updated_at?: string
          created_by: string
          assigned_to?: string | null
          team_id?: string | null
          custom_fields?: Json | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          created_at?: string
          updated_at?: string
          created_by?: string
          assigned_to?: string | null
          team_id?: string | null
          custom_fields?: Json | null
          tags?: string[] | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          lead_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          lead_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          lead_id?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          email?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 