import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BulkStatusDialog } from '@/components/tickets/BulkStatusDialog'
import { ticketService } from '@/services/ticket.service'
import { TICKET_STATUS, TicketStatus } from '@/types/models/ticket.types'
import { toast } from 'sonner'

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}))

// Mock the ticket service with proper types
vi.mock('@/services/ticket.service', () => ({
  ticketService: {
    bulkUpdateStatus: vi.fn().mockImplementation(async () => Promise.resolve())
  }
}))

describe('BulkStatusDialog', () => {
  const mockTicketIds = ['1', '2']
  const mockOnClose = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders status options', () => {
    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    Object.entries(TICKET_STATUS).forEach(([key, value]) => {
      expect(screen.getByText(value)).toBeInTheDocument()
    })
  })

  it('handles successful status update for single ticket', async () => {
    const newStatus = 'in_progress' as TicketStatus
    vi.mocked(ticketService.bulkUpdateStatus).mockResolvedValueOnce(undefined)

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={['1']}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText(TICKET_STATUS.in_progress))
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalledWith(['1'], newStatus)
      expect(toast.success).toHaveBeenCalledWith('Successfully updated 1 ticket')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles successful status update for multiple tickets', async () => {
    const newStatus = 'resolved' as TicketStatus
    vi.mocked(ticketService.bulkUpdateStatus).mockResolvedValueOnce(undefined)

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText(TICKET_STATUS.resolved))
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalledWith(mockTicketIds, newStatus)
      expect(toast.success).toHaveBeenCalledWith('Successfully updated 2 tickets')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles failed status update', async () => {
    const newStatus = 'closed' as TicketStatus
    const error = new Error('Failed to update tickets')
    vi.mocked(ticketService.bulkUpdateStatus).mockRejectedValueOnce(error)

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText(TICKET_STATUS.closed))
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalledWith(mockTicketIds, newStatus)
      expect(toast.error).toHaveBeenCalledWith('Failed to update tickets')
      expect(mockOnUpdate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('shows loading state during update', async () => {
    // Create a promise that we can resolve later
    let resolveUpdate: () => void
    const updatePromise = new Promise<void>((resolve) => {
      resolveUpdate = resolve
    })
    vi.mocked(ticketService.bulkUpdateStatus).mockImplementationOnce(() => updatePromise)

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText(TICKET_STATUS.open))
    fireEvent.click(screen.getByText('Update'))

    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Updating...' })).toBeDisabled()
    })

    // Resolve the update
    resolveUpdate!()

    // Check that loading state is cleared
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Updating...' })).not.toBeInTheDocument()
    })
  })

  it('closes when cancel is clicked', () => {
    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })
}) 