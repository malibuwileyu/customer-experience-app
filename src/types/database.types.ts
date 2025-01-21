export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'agent' | 'team_lead' | 'customer';
    };
  };
}; 