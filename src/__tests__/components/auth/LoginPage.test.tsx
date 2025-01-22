import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import { LoginPage } from '../../../pages/auth/LoginPage'
import { AuthProvider } from '../../../contexts/AuthContext'
import { createClient, User, Session } from '@supabase/supabase-js'

// Mock supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  }
})

describe('LoginPage', () => {
  const mockNavigate = vi.fn()
  const mockLocation = {
    pathname: '/login',
    search: '',
    hash: '',
    state: { from: '/app/tickets' },
    key: 'default',
  }

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
    role: '',
    updated_at: '2024-01-01T00:00:00.000Z',
  }

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  }

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useLocation).mockReturnValue(mockLocation)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid email', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('successfully logs in with valid credentials', async () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    const { supabase } = await import('../../../lib/supabase')
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const form = screen.getByRole('form')

    await userEvent.type(emailInput, validCredentials.email)
    await userEvent.type(passwordInput, validCredentials.password)
    
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await fireEvent.submit(form)

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(validCredentials)
      expect(mockNavigate).toHaveBeenCalledWith('/app/tickets', { replace: true })
    })
  })

  it('shows error for invalid credentials', async () => {
    const invalidCredentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    }

    const { supabase } = await import('../../../lib/supabase')
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { 
        message: 'Invalid credentials',
        name: 'AuthApiError',
        status: 400,
        __isAuthError: true,
      } as any,
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const form = screen.getByRole('form')

    await userEvent.type(emailInput, invalidCredentials.email)
    await userEvent.type(passwordInput, invalidCredentials.password)
    
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await fireEvent.submit(form)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveTextContent(/invalid credentials/i)
    })
  })

  it('redirects to dashboard if already logged in', async () => {
    const { supabase } = await import('../../../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: mockSession,
      },
      error: null,
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard', { replace: true })
    })
  })
}) 