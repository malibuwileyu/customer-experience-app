import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'agent' | 'team_lead' | 'customer';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  preferences: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; role?: UserRole }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
} 