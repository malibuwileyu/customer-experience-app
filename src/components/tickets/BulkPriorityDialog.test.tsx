import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BulkPriorityDialog } from './BulkPriorityDialog'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import { TicketPriority, TICKET_PRIORITY } from '../../types/models/ticket.types'

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}))

// Mock the ticket service
vi.mock('../../services/ticket.service', () => ({
  ticketService: {
    bulkUpdatePriority: vi.fn()
  }
}))

describe('BulkPriorityDialog', () => {
  const mockTicketIds = ['1', '2', '3']
  const mockOnClose = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dialog with priority options', () => {
    render(
      <BulkPriorityDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Update Ticket Priority')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    
    // Verify all priority options are rendered
    Object.entries(TICKET_PRIORITY).forEach(([key, value]) => {
      expect(screen.getByText(value)).toBeInTheDocument()
    })
  })

  it('handles successful priority update for single ticket', async () => {
    const newPriority: TicketPriority = 'high'
    vi.mocked(ticketService.bulkUpdatePriority).mockResolvedValueOnce()

    render(
      <BulkPriorityDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={['1']}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new priority
    fireEvent.change(screen.getByRole('combobox'), { target: { value: newPriority } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdatePriority).toHaveBeenCalledWith(['1'], newPriority)
      expect(toast.success).toHaveBeenCalledWith('Successfully updated 1 ticket')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles successful priority update for multiple tickets', async () => {
    const newPriority: TicketPriority = 'urgent'
    vi.mocked(ticketService.bulkUpdatePriority).mockResolvedValueOnce()

    render(
      <BulkPriorityDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new priority
    fireEvent.change(screen.getByRole('combobox'), { target: { value: newPriority } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdatePriority).toHaveBeenCalledWith(mockTicketIds, newPriority)
      expect(toast.success).toHaveBeenCalledWith('Successfully updated 3 tickets')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles failed priority update', async () => {
    const error = new Error('Failed to update priority')
    vi.mocked(ticketService.bulkUpdatePriority).mockRejectedValueOnce(error)

    render(
      <BulkPriorityDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new priority
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'high' } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdatePriority).toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Failed to update tickets')
      expect(mockOnUpdate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('shows loading state during update', async () => {
    vi.mocked(ticketService.bulkUpdatePriority).mockImplementationOnce(() => new Promise(() => {}))

    render(
      <BulkPriorityDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new priority
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'high' } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    expect(screen.getByText('Updating...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Updating...' })).toBeDisabled()
  })

  it('closes when cancel is clicked', () => {
    render(
      <BulkPriorityDialog
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