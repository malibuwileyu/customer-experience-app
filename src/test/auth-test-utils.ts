/**
 * @fileoverview Authentication testing utilities
 * @module test/auth-test-utils
 * @description
 * Provides mock data and helper functions for testing authentication-related
 * functionality. Includes mock user data, sessions, and Supabase client mocks.
 */

import { vi } from 'vitest';
import { AuthError, Session, User, AuthTokenResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Mock user data representing an authenticated user
 * 
 * @type {User}
 * @property {string} id - Unique user identifier
 * @property {string} email - User's email address
 * @property {string} role - Base authentication role
 * @property {Object} user_metadata - Custom user metadata
 */
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

/**
 * Mock user profile data
 * 
 * @type {Object}
 * @property {string} id - Matches the mock user ID
 * @property {string} full_name - User's display name
 * @property {string} role - User's role in the system
 * @property {Object} preferences - User preferences
 */
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

/**
 * Mock authentication session
 * 
 * @type {Session}
 * @property {string} access_token - JWT access token
 * @property {string} refresh_token - JWT refresh token
 * @property {number} expires_in - Token expiration time in seconds
 * @property {User} user - Associated user data
 */
export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: new Date().getTime() + 3600000,
  token_type: 'bearer',
  user: mockUser,
};

/**
 * Mock successful authentication response
 * 
 * @type {AuthTokenResponse}
 * @property {Object} data - Contains user and session data
 * @property {null} error - No error for successful response
 */
export const mockAuthResponse: AuthTokenResponse = {
  data: {
    user: mockUser,
    session: mockSession,
  },
  error: null,
};

/**
 * Mock Supabase client implementation
 * 
 * Provides mock implementations for:
 * - Authentication methods (signIn, signUp, signOut)
 * - Session management
 * - Database operations
 * 
 * @example
 * ```typescript
 * // In your test file
 * import { supabase } from '../lib/supabase';
 * import { setupSuccessfulAuth } from './auth-test-utils';
 * 
 * test('successful login', async () => {
 *   setupSuccessfulAuth();
 *   const response = await supabase.auth.signInWithPassword({
 *     email: 'test@example.com',
 *     password: 'password'
 *   });
 *   expect(response.error).toBeNull();
 * });
 * ```
 */
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

/**
 * Sets up successful authentication mocks
 * 
 * Configures the Supabase client mock to simulate successful:
 * - Sign in attempts
 * - Session retrieval
 * 
 * @function
 * @example
 * ```typescript
 * beforeEach(() => {
 *   setupSuccessfulAuth();
 * });
 * ```
 */
export const setupSuccessfulAuth = () => {
  vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockAuthResponse);
  vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null });
};

/**
 * Sets up failed authentication mocks
 * 
 * Configures the Supabase client mock to simulate authentication failures
 * with a custom error message.
 * 
 * @function
 * @param {string} message - Custom error message for the auth failure
 * @example
 * ```typescript
 * test('handles invalid credentials', async () => {
 *   setupFailedAuth('Invalid email or password');
 *   const response = await supabase.auth.signInWithPassword({
 *     email: 'wrong@example.com',
 *     password: 'wrong'
 *   });
 *   expect(response.error?.message).toBe('Invalid email or password');
 * });
 * ```
 */
export const setupFailedAuth = (message: string) => {
  const error = new AuthError(message);
  vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ data: { user: null, session: null }, error });
}; 