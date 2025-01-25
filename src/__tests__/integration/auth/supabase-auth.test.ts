import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { supabase } from '../../../lib/supabase';

describe('Supabase Auth Integration Tests', () => {
  // Test user credentials
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';
  
  // Clean up function to delete test users
  async function deleteTestUser(email: string) {
    try {
      // Try to sign in as the test user first
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password: testPassword
      });

      if (signInData.user) {
        // If we can sign in, delete the user's own account
        await supabase.auth.admin.deleteUser(signInData.user.id);
      }
    } catch (err) {
      console.warn('Failed to delete test user:', err);
      // Continue execution even if cleanup fails
    }
  }

  beforeAll(async () => {
    // Ensure we can connect to Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Initial session check:', {
      hasSession: !!session,
      error: error?.message
    });
  });

  afterAll(async () => {
    // Clean up test users
    await deleteTestUser(testEmail);
  });

  beforeEach(async () => {
    // Sign out before each test
    await supabase.auth.signOut();
  });

  describe('Registration', () => {
    it('should fail with invalid email format', async () => {
      const invalidEmail = 'not-an-email';
      
      const { data, error } = await supabase.auth.signUp({
        email: invalidEmail,
        password: testPassword
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('invalid');
      expect(data.user).toBeNull();
    });

    it('should fail with weak password', async () => {
      const weakPassword = '123';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: weakPassword
      });

      expect(error).not.toBeNull();
      expect(error?.message.toLowerCase()).toContain('password');
      expect(data.user).toBeNull();
    });

    it('should create a user with valid credentials', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
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
      expect(data.user?.email).toBe(testEmail);
      expect(data.user?.id).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      // Try to register with the same email
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      expect(error).not.toBeNull();
      expect(error?.message.toLowerCase()).toContain('already registered');
      expect(data.user).toBeNull();
    });
  });

  describe('Authentication', () => {
    it('should sign in with correct credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      expect(error).toBeNull();
      expect(data.user).not.toBeNull();
      expect(data.user?.email).toBe(testEmail);
    });

    it('should fail with incorrect password', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'wrongpassword'
      });

      expect(error).not.toBeNull();
      expect(error?.message.toLowerCase()).toContain('invalid');
      expect(data.user).toBeNull();
    });

    it('should fail with non-existent email', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: testPassword
      });

      expect(error).not.toBeNull();
      expect(error?.message.toLowerCase()).toContain('invalid');
      expect(data.user).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should maintain session after login', async () => {
      // First login
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      // Check session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      expect(error).toBeNull();
      expect(session).not.toBeNull();
      expect(session?.user.email).toBe(testEmail);
    });

    it('should clear session after logout', async () => {
      // First login
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      // Then logout
      await supabase.auth.signOut();

      // Check session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      expect(error).toBeNull();
      expect(session).toBeNull();
    });
  });
}); 