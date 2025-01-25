import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TicketItem } from '../../../../components/tickets/ticket-item'
import type { Ticket, TicketPriority, TicketStatus } from '../../../../types/models/ticket.types'

const mockTicket: Ticket = {
  id: '1',
  title: 'Test Ticket',
  description: 'Test Description',
  status: 'open' as TicketStatus,
  priority: 'high' as TicketPriority,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'user1',
  assignee_id: undefined,
  team_id: undefined,
  attachments: []
}

describe('TicketItem', () => {
  it('renders ticket details correctly', () => {
    render(<TicketItem ticket={mockTicket} />)
    
    expect(screen.getByText('Test Ticket')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText(/open/i)).toBeInTheDocument()
    expect(screen.getByText(/high/i)).toBeInTheDocument()
  })

  it('handles selection when checkbox is clicked', () => {
    const onSelect = vi.fn()
    render(<TicketItem ticket={mockTicket} selected={false} onSelect={onSelect} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('shows selected state correctly', () => {
    render(<TicketItem ticket={mockTicket} selected={true} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('displays team assignment when team_id is present', () => {
    const ticketWithTeam = {
      ...mockTicket,
      team_id: 'team1'
    }
    render(<TicketItem ticket={ticketWithTeam} />)
    
    expect(screen.getByText(/team1/i)).toBeInTheDocument()
  })

  it('displays assignee when assignee_id is present', () => {
    const ticketWithAssignee = {
      ...mockTicket,
      assignee_id: 'user2'
    }
    render(<TicketItem ticket={ticketWithAssignee} />)
    
    expect(screen.getByText(/user2/i)).toBeInTheDocument()
  })

  it('displays creation date in readable format', () => {
    const date = new Date()
    const ticketWithDate = {
      ...mockTicket,
      created_at: date.toISOString()
    }
    render(<TicketItem ticket={ticketWithDate} />)
    
    // This assumes we're using some date formatting in the component
    expect(screen.getByText(new RegExp(date.toLocaleDateString(), 'i'))).toBeInTheDocument()
  })

  it('shows attachment indicator when ticket has attachments', () => {
    const ticketWithAttachments = {
      ...mockTicket,
      attachments: ['file1.pdf', 'file2.jpg']
    }
    render(<TicketItem ticket={ticketWithAttachments} />)
    
    expect(screen.getByText(/2 attachments/i)).toBeInTheDocument()
  })
}) 