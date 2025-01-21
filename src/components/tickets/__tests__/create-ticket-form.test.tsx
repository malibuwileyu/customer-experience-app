import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTicketForm } from '../create-ticket-form'
import { useCreateTicket } from '../../../hooks/tickets/use-create-ticket'

// Mock the custom hook
vi.mock('../../../hooks/tickets/use-create-ticket', () => ({
  useCreateTicket: vi.fn()
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('CreateTicketForm', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementation
    vi.mocked(useCreateTicket).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null
    } as any)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<CreateTicketForm />)

    // Check for form elements
    expect(screen.getByLabelText(/title/i)).toBeDefined()
    expect(screen.getByLabelText(/description/i)).toBeDefined()
    expect(screen.getByRole('combobox')).toBeDefined()
    expect(screen.getByLabelText(/internal notes/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeDefined()
  })

  it('validates required fields', async () => {
    render(<CreateTicketForm />)
    const user = userEvent.setup()

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /create ticket/i }))

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i).getAttribute('aria-invalid')).toBe('true')
      expect(screen.getByLabelText(/description/i).getAttribute('aria-invalid')).toBe('true')
    })
  })

  it('submits form with valid data', async () => {
    render(<CreateTicketForm />)
    const user = userEvent.setup()

    // Fill out form
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
    await user.type(screen.getByLabelText(/description/i), 'This is a test ticket description')
    
    // Change priority using the select
    const prioritySelect = screen.getByRole('combobox')
    await user.click(prioritySelect)
    await user.click(screen.getByRole('option', { name: 'High' }))
    
    await user.type(screen.getByLabelText(/internal notes/i), 'Test internal note')

    // Submit form
    await user.click(screen.getByRole('button', { name: /create ticket/i }))

    // Verify submission
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test Ticket',
        description: 'This is a test ticket description',
        priority: 'high',
        internal_notes: 'Test internal note'
      })
    })
  })

  it('shows loading state during submission', async () => {
    vi.mocked(useCreateTicket).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null
    } as any)

    render(<CreateTicketForm />)

    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton.getAttribute('disabled')).toBe('')
  })

  it('shows error message on submission failure', async () => {
    vi.mocked(useCreateTicket).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error('Failed to create ticket')
    } as any)

    render(<CreateTicketForm />)

    expect(screen.getByText('Failed to create ticket')).toBeDefined()
  })

  // TODO: Implement form reset functionality post-MVP
  // it('resets form on reset button click', async () => {
  //   render(<CreateTicketForm />)
  //   const user = userEvent.setup()

  //   // Fill out form fields
  //   await user.type(screen.getByLabelText(/title/i), 'Test Title')
  //   await user.type(screen.getByLabelText(/description/i), 'Test Description')
  //   await user.type(screen.getByLabelText(/internal notes/i), 'Test Notes')

  //   // Change priority to High
  //   await act(async () => {
  //     const select = screen.getByRole('combobox', { name: /priority/i })
  //     await user.click(select)
  //     await waitFor(() => {
  //       expect(screen.getByRole('listbox')).toBeInTheDocument()
  //     })
  //     const highOption = screen.getByText('High')
  //     await user.click(highOption)
  //   })

  //   // Verify form was filled out
  //   expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe('Test Title')
  //   expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe('Test Description')
  //   expect((screen.getByLabelText(/internal notes/i) as HTMLTextAreaElement).value).toBe('Test Notes')
  //   expect(screen.getByRole('combobox', { name: /priority/i })).toHaveTextContent('High')

  //   // Click reset button
  //   await user.click(screen.getByRole('button', { name: /reset/i }))

  //   // Verify form was reset
  //   expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe('')
  //   expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe('')
  //   expect((screen.getByLabelText(/internal notes/i) as HTMLTextAreaElement).value).toBe('')
  //   expect(screen.getByRole('combobox', { name: /priority/i })).toHaveTextContent('Medium')
  // })
}) 