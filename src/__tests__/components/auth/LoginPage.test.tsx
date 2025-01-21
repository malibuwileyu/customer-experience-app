import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { LoginPage } from '../../../pages/auth/LoginPage'
import { AuthProvider, useAuth } from '../../../contexts/AuthContext'
import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../../lib/supabase'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
    UNSAFE_DataRouterContext: vi.fn(),
    UNSAFE_DataRouterStateContext: vi.fn(),
    UNSAFE_NavigationContext: vi.fn(),
    UNSAFE_LocationContext: vi.fn(),
    UNSAFE_RouteContext: vi.fn()
  }
})

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

describe('LoginPage', () => {
  const mockNavigate = vi.fn()

  beforeEach(async () => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    // Sign out before each test
    await supabase.auth.signOut()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderLoginPage = () => {
    const Wrapper = () => {
      const methods = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
          email: '',
          password: '',
        },
        mode: 'onChange',
      })
      return (
        <BrowserRouter>
          <AuthProvider>
            <FormProvider {...methods}>
              <LoginPage />
            </FormProvider>
          </AuthProvider>
        </BrowserRouter>
      )
    }
    return render(<Wrapper />)
  }

  it('renders login form', () => {
    renderLoginPage()
    
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(screen.getByLabelText(/password/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined()
  })

  it('shows validation error for invalid email', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText(/^email$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    // Type invalid email
    await userEvent.type(emailInput, 'not-an-email')
    await userEvent.type(passwordInput, 'password123')
    
    // Wait for validation message
    await waitFor(async () => {
      const errorMessage = await screen.findByText(/invalid email format/i)
      expect(errorMessage).toBeDefined()
    })
  })

  it('successfully logs in with valid credentials', async () => {
    // Create a test user first
    const validEmail = `testuser_${Date.now()}@gmail.com`
    const validPassword = 'testPassword123!'
    
    const { error: signUpError } = await supabase.auth.signUp({
      email: validEmail,
      password: validPassword
    })
    
    expect(signUpError).toBeNull()
    
    renderLoginPage()
    
    // Attempt login with valid credentials
    await userEvent.type(screen.getByLabelText(/email/i), validEmail)
    await userEvent.type(screen.getByLabelText(/password/i), validPassword)
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error for invalid credentials', async () => {
    renderLoginPage()
    
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@email.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeDefined()
    })
  })

  it('shows loading state during login attempt', async () => {
    renderLoginPage()
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(screen.getByText(/signing in/i)).toBeDefined()
  })
}); 