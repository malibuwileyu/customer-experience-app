import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BulkStatusDialog } from './BulkStatusDialog'
import { ticketService } from '../../services/ticket.service'
import { toast } from 'sonner'
import { TicketStatus, TICKET_STATUS } from '../../types/models/ticket.types'

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
    bulkUpdateStatus: vi.fn()
  }
}))

describe('BulkStatusDialog', () => {
  const mockTicketIds = ['1', '2', '3']
  const mockOnClose = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dialog with status options', () => {
    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Update Ticket Status')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    
    // Verify all status options are rendered
    Object.entries(TICKET_STATUS).forEach(([key, value]) => {
      expect(screen.getByText(value)).toBeInTheDocument()
    })
  })

  it('handles successful status update for single ticket', async () => {
    const newStatus: TicketStatus = 'in_progress'
    vi.mocked(ticketService.bulkUpdateStatus).mockResolvedValueOnce()

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={['1']}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: newStatus } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalledWith(['1'], newStatus)
      expect(toast.success).toHaveBeenCalledWith('Successfully updated 1 ticket')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles successful status update for multiple tickets', async () => {
    const newStatus: TicketStatus = 'resolved'
    vi.mocked(ticketService.bulkUpdateStatus).mockResolvedValueOnce()

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: newStatus } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalledWith(mockTicketIds, newStatus)
      expect(toast.success).toHaveBeenCalledWith('Successfully updated 3 tickets')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles failed status update', async () => {
    const error = new Error('Failed to update status')
    vi.mocked(ticketService.bulkUpdateStatus).mockRejectedValueOnce(error)

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'in_progress' } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Failed to update tickets')
      expect(mockOnUpdate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('shows loading state during update', async () => {
    vi.mocked(ticketService.bulkUpdateStatus).mockImplementationOnce(() => new Promise(() => {}))

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a new status
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'in_progress' } })

    // Click update button
    fireEvent.click(screen.getByText('Update'))

    expect(screen.getByText('Updating...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Updating...' })).toBeDisabled()
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