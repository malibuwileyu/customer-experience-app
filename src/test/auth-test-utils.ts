import { vi } from 'vitest';
import { AuthError, Session, User, AuthTokenResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Mock user data
export const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: {
    role: 'customer',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  factors: [],
};

export const mockProfile = {
  id: mockUser.id,
  full_name: 'Test User',
  role: 'customer',
  avatar_url: null,
  preferences: {},
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_seen_at: null,
};

// Mock session
export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: new Date().getTime() + 3600000,
  token_type: 'bearer',
  user: mockUser,
};

// Mock auth response
export const mockAuthResponse: AuthTokenResponse = {
  data: {
    user: mockUser,
    session: mockSession,
  },
  error: null,
};

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Helper to setup successful auth
export const setupSuccessfulAuth = () => {
  vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockAuthResponse);
  vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null });
};

// Helper to setup failed auth
export const setupFailedAuth = (message: string) => {
  const error = new AuthError(message);
  vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ data: { user: null, session: null }, error });
}; 