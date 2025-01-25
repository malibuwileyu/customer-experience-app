import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TicketItem } from '@/components/tickets/ticket-item'
import type { Ticket, TicketPriority, TicketStatus } from '@/types/models/ticket.types'
import { BrowserRouter } from 'react-router-dom'

const mockTicket: Ticket = {
  id: '1',
  title: 'Test Ticket',
  description: 'Test Description',
  status: 'open' as TicketStatus,
  priority: 'high' as TicketPriority,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'user1',
  team_id: undefined,
  assignee_id: undefined,
  attachments: []
}

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter })
}

describe('TicketItem', () => {
  it('renders ticket details correctly', () => {
    renderWithRouter(<TicketItem ticket={mockTicket} />)
    
    expect(screen.getByText('Test Ticket')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('handles checkbox selection', () => {
    const onSelect = vi.fn()
    renderWithRouter(<TicketItem ticket={mockTicket} onSelect={onSelect} />)
    
    const checkbox = screen.getByRole('checkbox', { name: /select ticket/i })
    fireEvent.click(checkbox)
    
    expect(onSelect).toHaveBeenCalledWith(mockTicket.id)
  })

  it('shows selected state', () => {
    renderWithRouter(<TicketItem ticket={mockTicket} selected={true} />)
    
    const checkbox = screen.getByRole('checkbox', { name: /select ticket/i })
    expect(checkbox).toBeChecked()
  })

  it('displays assignee avatar when assignee_id is present', () => {
    renderWithRouter(
      <TicketItem 
        ticket={{ 
          ...mockTicket, 
          assignee_id: 'user1'
        }} 
      />
    )
    
    expect(screen.getByText('U')).toBeInTheDocument() // Avatar fallback with first letter
  })

  it('displays creation date with "ago"', () => {
    const date = new Date()
    renderWithRouter(
      <TicketItem 
        ticket={{ 
          ...mockTicket, 
          created_at: date.toISOString()
        }} 
      />
    )
    
    expect(screen.getByText(/Created .* ago/)).toBeInTheDocument()
  })

  it('displays ticket ID', () => {
    renderWithRouter(<TicketItem ticket={mockTicket} />)
    
    expect(screen.getByText(`#${mockTicket.id.slice(0, 8)}`)).toBeInTheDocument()
  })

  it('displays edit button', () => {
    renderWithRouter(<TicketItem ticket={mockTicket} />)
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })
}) 