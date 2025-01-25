import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketList } from '../../../../components/tickets/ticket-list'
import { useTickets } from '../../../../hooks/tickets/use-tickets'
import { useAllTickets } from '../../../../hooks/tickets/use-all-tickets'
import type { Ticket, TicketPriority, TicketStatus } from '../../../../types/models/ticket.types'

// Mock the hooks
vi.mock('../../../../hooks/tickets/use-tickets')
vi.mock('../../../../hooks/tickets/use-all-tickets')
vi.mock('../../../../hooks/tickets/use-ticket-subscription', () => ({
  useTicketSubscription: vi.fn()
}))

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Test Ticket 1',
    description: 'Description 1',
    status: 'open' as TicketStatus,
    priority: 'high' as TicketPriority,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user1',
    assignee_id: undefined,
    team_id: undefined,
    attachments: []
  },
  {
    id: '2',
    title: 'Test Ticket 2',
    description: 'Description 2',
    status: 'in_progress' as TicketStatus,
    priority: 'medium' as TicketPriority,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user2',
    assignee_id: 'user3',
    team_id: 'team1',
    attachments: []
  }
]

describe('TicketList', () => {
  beforeEach(() => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
      error: null,
      totalCount: mockTickets.length
    })
    vi.mocked(useAllTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
      error: null,
      totalCount: mockTickets.length
    })
  })

  it('renders loading state', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: [],
      isLoading: true,
      error: null,
      totalCount: 0
    })

    render(<TicketList />)
    expect(screen.getByTestId('ticket-skeleton')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: [],
      isLoading: false,
      error: new Error('Failed to fetch tickets'),
      totalCount: 0
    })

    render(<TicketList />)
    expect(screen.getByText(/failed to load tickets/i)).toBeInTheDocument()
  })

  it('renders tickets in normal view', () => {
    render(<TicketList />)
    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument()
  })

  it('renders tickets in admin view', () => {
    render(<TicketList isAdminView={true} />)
    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument()
  })

  it('handles ticket selection', () => {
    const onSelectTicket = vi.fn()
    render(<TicketList selectedTickets={[]} onSelectTicket={onSelectTicket} />)
    
    const checkbox = screen.getAllByRole('checkbox')[1] // First checkbox is "select all"
    fireEvent.click(checkbox)
    
    expect(onSelectTicket).toHaveBeenCalledWith('1')
  })

  it('handles select all', () => {
    const onSelectAll = vi.fn()
    render(<TicketList selectedTickets={[]} onSelectAll={onSelectAll} />)
    
    const selectAllCheckbox = screen.getByLabelText(/select all/i)
    fireEvent.click(selectAllCheckbox)
    
    expect(onSelectAll).toHaveBeenCalledWith(['1', '2'])
  })

  it('displays empty state when no tickets', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: [],
      isLoading: false,
      error: null,
      totalCount: 0
    })

    render(<TicketList />)
    expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
  })
}) 