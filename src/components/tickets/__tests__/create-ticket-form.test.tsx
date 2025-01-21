import { vi, describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTicketForm } from '../create-ticket-form'
import { useCreateTicket } from '../../../hooks/tickets/use-create-ticket'
import type { TicketPriority, CreateTicketDTO } from '../../../types/models/ticket.types'

const defaultVariables: CreateTicketDTO = {
  title: '',
  description: '',
  priority: 'medium' as TicketPriority
}

const defaultMockMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false as const,
  isError: false as const,
  isSuccess: false as const,
  isIdle: true as const,
  error: null,
  data: undefined,
  reset: vi.fn(),
  variables: undefined,
  failureCount: 0,
  failureReason: null,
  status: 'idle' as const,
  context: undefined,
  isPaused: false,
  submittedAt: 0
}

// Mock the useCreateTicket hook
vi.mock('../../../hooks/tickets/use-create-ticket', () => ({
  useCreateTicket: vi.fn(() => defaultMockMutation)
}))

describe('CreateTicketForm', () => {
  it('renders form fields correctly', () => {
    render(<CreateTicketForm />)
    expect(screen.getByLabelText(/title/i)).toBeDefined()
    expect(screen.getByLabelText(/description/i)).toBeDefined()
    expect(screen.getByLabelText(/priority/i)).toBeDefined()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<CreateTicketForm />)

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /create ticket/i }))

    // Check validation errors
    await waitFor(() => {
      // The FormMessage component renders validation messages in a div with role="alert"
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some(alert => alert.textContent?.includes('Title must be at least 3 characters'))).toBe(true)
      expect(alerts.some(alert => alert.textContent?.includes('Description must be at least 10 characters'))).toBe(true)
    })
  })

  it('submits form with valid data', async () => {
    const mockMutate = vi.fn()
    const mockHook = vi.fn(() => ({
      ...defaultMockMutation,
      mutate: mockMutate,
      mutateAsync: vi.fn()
    }))
    vi.mocked(useCreateTicket).mockImplementation(mockHook)

    const user = userEvent.setup()
    render(<CreateTicketForm />)

    // Fill in form fields
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
    await user.type(screen.getByLabelText(/description/i), 'This is a test ticket description')

    // Submit form
    await user.click(screen.getByRole('button', { name: /create ticket/i }))

    // Verify submission
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test Ticket',
        description: 'This is a test ticket description',
        priority: 'medium'
      })
    })
  })

  it('shows loading state during submission', () => {
    const loadingVariables: CreateTicketDTO = {
      title: 'Test Ticket',
      description: 'This is a test ticket description',
      priority: 'medium'
    }

    const mockHook = vi.fn(() => ({
      ...defaultMockMutation,
      isPending: true as const,
      isIdle: false as const,
      isError: false as const,
      isSuccess: false as const,
      data: undefined,
      variables: loadingVariables,
      status: 'pending' as const,
      mutateAsync: vi.fn()
    }))
    vi.mocked(useCreateTicket).mockImplementation(mockHook)

    render(<CreateTicketForm />)
    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton).toBeDefined()
    expect(submitButton.hasAttribute('disabled')).toBe(true)
  })

  it('shows error message on submission failure', () => {
    const errorVariables: CreateTicketDTO = {
      title: 'Test Ticket',
      description: 'This is a test ticket description',
      priority: 'medium'
    }

    const mockHook = vi.fn(() => ({
      ...defaultMockMutation,
      isPending: false as const,
      isError: true as const,
      isSuccess: false as const,
      isIdle: false as const,
      error: new Error('Failed to create ticket'),
      data: undefined,
      variables: errorVariables,
      failureCount: 1,
      failureReason: new Error('Failed to create ticket'),
      status: 'error' as const,
      mutateAsync: vi.fn()
    }))
    vi.mocked(useCreateTicket).mockImplementation(mockHook)

    render(<CreateTicketForm />)
    expect(screen.getByText(/failed to create ticket/i)).toBeDefined()
  })
}) 