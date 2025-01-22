import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { RegistrationPage } from '../../../pages/auth/RegistrationPage';
import { useAuth } from '../../../contexts/AuthContext';
import { User, Session } from '@supabase/supabase-js';

// Mock supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock AuthContext
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('RegistrationPage', () => {
  const mockNavigate = vi.fn();
  const mockRegister = vi.fn();
  
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
    role: '',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useAuth as any).mockReturnValue({
      register: mockRegister,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const validData = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('renders registration form', () => {
    render(
      <BrowserRouter>
        <RegistrationPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid email', async () => {
    render(
      <BrowserRouter>
        <RegistrationPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      await fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      await fireEvent.blur(emailInput);
    });

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <RegistrationPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await act(async () => {
      await fireEvent.change(passwordInput, { target: { value: 'password123' } });
      await fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
      await fireEvent.blur(confirmPasswordInput);
    });

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('successfully registers with valid data', async () => {
    mockRegister.mockResolvedValueOnce({
      data: { user: { id: '1', email: validData.email } },
      error: null,
    });

    render(
      <BrowserRouter>
        <RegistrationPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await act(async () => {
      await fireEvent.change(emailInput, { target: { value: validData.email } });
      await fireEvent.change(passwordInput, { target: { value: validData.password } });
      await fireEvent.change(confirmPasswordInput, { target: { value: validData.confirmPassword } });
      await fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: validData.email,
        password: validData.password,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error for duplicate email registration', async () => {
    mockRegister.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered' },
    });

    render(
      <BrowserRouter>
        <RegistrationPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await act(async () => {
      await fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      await fireEvent.change(passwordInput, { target: { value: validData.password } });
      await fireEvent.change(confirmPasswordInput, { target: { value: validData.confirmPassword } });
      await fireEvent.submit(screen.getByRole('form'));
    });

    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/user already registered/i);
    });
  });
}); 