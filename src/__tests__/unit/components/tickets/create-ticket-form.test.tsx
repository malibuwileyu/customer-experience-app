import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTicketForm } from '@/components/tickets/create-ticket-form'
import { useCreateTicket } from '@/hooks/tickets/use-create-ticket'
import type { CreateTicketDTO, Ticket } from '@/types/models/ticket.types'
import type { UseMutationResult } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/hooks/tickets/use-create-ticket')
vi.mock('@/hooks/auth/use-auth', () => ({
  useAuth: () => ({ user: { id: 'user1', role: 'agent' } })
}))
vi.mock('@/hooks/auth/use-user-roles', () => ({
  useUserRoles: () => ({ roles: ['agent'] })
}))

const mockMutate = vi.fn()

const defaultMockResult = {
  mutate: mockMutate,
  mutateAsync: vi.fn(),
  data: undefined,
  error: null,
  isError: false as const,
  isIdle: true as const,
  isPending: false as const,
  isSuccess: false as const,
  reset: vi.fn(),
  status: 'idle' as const,
  variables: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  context: undefined,
  submittedAt: 0,
} satisfies UseMutationResult<Ticket, Error, CreateTicketDTO, unknown>

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter })
}

describe('CreateTicketForm', () => {
  beforeEach(() => {
    vi.mocked(useCreateTicket).mockReturnValue(defaultMockResult)
    mockMutate.mockClear()
  })

  it('renders form fields', () => {
    renderWithRouter(<CreateTicketForm />)

    // Check for form field labels
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/internal notes/i)).toBeInTheDocument()
    
    // Check for file upload
    expect(screen.getByText(/upload files/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CreateTicketForm />)

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /create/i }))

    // Wait for error messages
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
      expect(screen.getByText(/priority is required/i)).toBeInTheDocument()
    })

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CreateTicketForm />)

    // Fill in form fields
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
    await user.type(screen.getByLabelText(/description/i), 'Test Description')
    await user.click(screen.getByLabelText(/priority/i))
    await user.click(screen.getByText(/medium/i))
    await user.type(screen.getByLabelText(/internal notes/i), 'Internal note')

    // Submit form
    await user.click(screen.getByRole('button', { name: /create/i }))

    // Verify mutation was called with correct data
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'medium',
        internal_notes: 'Internal note'
      })
    })
  })

  it('shows loading state during submission', async () => {
    vi.mocked(useCreateTicket).mockReturnValue({
      ...defaultMockResult,
      isPending: true as const,
      isIdle: false as const,
      status: 'pending' as const,
      submittedAt: Date.now(),
      variables: {
        title: 'Test Ticket',
        description: 'This is a test ticket description',
        priority: 'medium',
      },
    })

    renderWithRouter(<CreateTicketForm />)

    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('shows error message on submission failure', () => {
    vi.mocked(useCreateTicket).mockReturnValue({
      ...defaultMockResult,
      error: new Error('Failed to create ticket'),
      isError: true as const,
      isIdle: false as const,
      status: 'error' as const,
      submittedAt: Date.now(),
      variables: {
        title: 'Test Ticket',
        description: 'This is a test ticket description',
        priority: 'medium',
      },
    })

    renderWithRouter(<CreateTicketForm />)

    expect(screen.getByText(/failed to create ticket/i)).toBeInTheDocument()
  })
}) 