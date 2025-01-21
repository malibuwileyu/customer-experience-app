import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { supabase } from '../../lib/supabase';

describe('Supabase Auth Integration', () => {
  beforeAll(async () => {
    // Check if we can connect to Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Initial session check:', {
      hasSession: !!session,
      error: sessionError?.message
    });
  });

  afterEach(async () => {
    // Clean up: Sign out after each test
    await supabase.auth.signOut();
  });

  it('should fail with invalid email format', async () => {
    const invalidEmail = 'not-an-email';
    const testPassword = 'testPassword123!';

    const { data, error } = await supabase.auth.signUp({
      email: invalidEmail,
      password: testPassword
    });

    expect(error).not.toBeNull();
    expect(error?.message).toContain('invalid');
    expect(data.user).toBeNull();
  });

  it('should create a user with valid email', async () => {
    const validEmail = `testuser_${Date.now()}@gmail.com`;
    const testPassword = 'testPassword123!';

    const { data, error } = await supabase.auth.signUp({
      email: validEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:5173'
      }
    });

    console.log('Sign up attempt:', {
      success: !error,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name
      } : null,
      user: data?.user ? {
        id: data.user.id,
        email: data.user.email
      } : null
    });

    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    expect(data.user?.email).toBe(validEmail);
    expect(data.user?.id).toBeDefined();
  });

  it('should not allow duplicate email signup', async () => {
    const validEmail = `testuser_${Date.now()}@gmail.com`;
    const testPassword = 'testPassword123!';

    // First signup
    await supabase.auth.signUp({
      email: validEmail,
      password: testPassword
    });

    // Try to signup with same email
    const { data, error } = await supabase.auth.signUp({
      email: validEmail,
      password: testPassword
    });

    expect(error).not.toBeNull();
    expect(error?.message).toContain('User already registered');
    expect(data.user).toBeNull();
  });
}); 