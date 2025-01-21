import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { RegistrationPage } from '../../../pages/auth/RegistrationPage';
import { AuthProvider } from '../../../contexts/AuthContext';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    UNSAFE_DataRouterContext: vi.fn(),
    UNSAFE_DataRouterStateContext: vi.fn(),
    UNSAFE_NavigationContext: vi.fn(),
    UNSAFE_LocationContext: vi.fn(),
    UNSAFE_RouteContext: vi.fn()
  };
});

const registrationSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

describe('RegistrationPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    // Sign out before each test
    await supabase.auth.signOut();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderRegistrationPage = () => {
    const Wrapper = () => {
      const methods = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
          email: '',
          password: '',
          confirmPassword: '',
        },
        mode: 'onChange',
      });
      return (
        <BrowserRouter>
          <AuthProvider>
            <FormProvider {...methods}>
              <RegistrationPage />
            </FormProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    };
    return render(<Wrapper />);
  };

  it('renders registration form', () => {
    renderRegistrationPage();
    
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/^password$/i)).toBeDefined();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDefined();
  });

  it('shows validation error for invalid email', async () => {
    renderRegistrationPage();
    
    await userEvent.type(screen.getByLabelText(/^email$/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/^confirm password$/i), 'password123');
    
    // Wait for validation message
    await waitFor(async () => {
      const errorMessage = await screen.findByText(/invalid email format/i);
      expect(errorMessage).toBeDefined();
    });
  });

  it('shows validation error for password mismatch', async () => {
    renderRegistrationPage();
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/^confirm password$/i), 'password456');
    
    // Wait for validation message
    await waitFor(async () => {
      const errorMessage = await screen.findByText(/passwords do not match/i);
      expect(errorMessage).toBeDefined();
    });
  });

  it('successfully registers with valid credentials', async () => {
    const validEmail = `testuser_${Date.now()}@gmail.com`;
    const validPassword = 'testPassword123!';
    
    renderRegistrationPage();
    
    await userEvent.type(screen.getByLabelText(/email/i), validEmail);
    await userEvent.type(screen.getByLabelText(/^password$/i), validPassword);
    await userEvent.type(screen.getByLabelText(/^confirm password$/i), validPassword);
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    // Verify user was created in Supabase
    const { data: { user }, error } = await supabase.auth.getUser();
    expect(error).toBeNull();
    expect(user?.email).toBe(validEmail);
  });

  it('shows error for duplicate email registration', async () => {
    const validEmail = `testuser_${Date.now()}@gmail.com`;
    const validPassword = 'testPassword123!';
    
    // Create first user
    const { error: signUpError } = await supabase.auth.signUp({
      email: validEmail,
      password: validPassword
    });
    expect(signUpError).toBeNull();
    
    renderRegistrationPage();
    
    // Try to register with same email
    await userEvent.type(screen.getByLabelText(/email/i), validEmail);
    await userEvent.type(screen.getByLabelText(/^password$/i), validPassword);
    await userEvent.type(screen.getByLabelText(/^confirm password$/i), validPassword);
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/user already registered/i)).toBeDefined();
    });
  });

  it('shows loading state during registration attempt', async () => {
    renderRegistrationPage();
    
    await userEvent.type(screen.getByLabelText(/email/i), `testuser_${Date.now()}@gmail.com`);
    await userEvent.type(screen.getByLabelText(/^password$/i), 'testPassword123!');
    await userEvent.type(screen.getByLabelText(/^confirm password$/i), 'testPassword123!');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/signing up/i)).toBeDefined();
  });

  it('has a link back to login page', () => {
    renderRegistrationPage();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeDefined();
  });
}); 