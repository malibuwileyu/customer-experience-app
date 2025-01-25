import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BulkStatusDialog } from '../../../../components/tickets/BulkStatusDialog'
import { useToast } from '../../../../hooks/use-toast'
import { ticketService } from '../../../../services/ticket.service'

// Mock dependencies
vi.mock('../../../../hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }))
}))

vi.mock('../../../../services/ticket.service', () => ({
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

  it('renders dialog with status options', () => {
    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText(/update status/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })

  it('handles status update success', async () => {
    const mockSuccess = vi.fn()
    vi.mocked(useToast).mockReturnValue({
      toast: vi.fn(),
      success: mockSuccess,
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn()
    })
    vi.mocked(ticketService.bulkUpdateStatus).mockResolvedValue(undefined)

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a status
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'in_progress' } })

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalledWith(mockTicketIds, 'in_progress')
      expect(mockSuccess).toHaveBeenCalledWith(
        'Successfully updated status for 3 tickets'
      )
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles status update failure', async () => {
    const mockError = vi.fn()
    vi.mocked(useToast).mockReturnValue({
      toast: vi.fn(),
      success: vi.fn(),
      error: mockError,
      warning: vi.fn(),
      info: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn()
    })
    vi.mocked(ticketService.bulkUpdateStatus).mockRejectedValue(new Error('Update failed'))

    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a status
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'in_progress' } })

    // Click update button
    const updateButton = screen.getByRole('button', { name: /update/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(ticketService.bulkUpdateStatus).toHaveBeenCalledWith(mockTicketIds, 'in_progress')
      expect(mockError).toHaveBeenCalledWith(
        'Failed to update ticket status'
      )
      expect(mockOnUpdate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('disables update button when no status is selected', () => {
    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update/i })
    expect(updateButton).toBeDisabled()
  })

  it('enables update button when status is selected', () => {
    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'in_progress' } })

    const updateButton = screen.getByRole('button', { name: /update/i })
    expect(updateButton).not.toBeDisabled()
  })

  it('closes dialog when cancel is clicked', () => {
    render(
      <BulkStatusDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
}) 