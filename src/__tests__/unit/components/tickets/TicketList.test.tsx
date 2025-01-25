import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketList } from '@/components/tickets/ticket-list'
import { useTickets } from '@/hooks/tickets/use-tickets'
import { useAllTickets } from '@/hooks/tickets/use-all-tickets'
import type { Ticket } from '@/types/models/ticket.types'
import { BrowserRouter } from 'react-router-dom'

// Mock the hooks
vi.mock('@/hooks/tickets/use-tickets')
vi.mock('@/hooks/tickets/use-all-tickets')
vi.mock('@/hooks/tickets/use-ticket-subscription')

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Test Ticket 1',
    description: 'Test Description 1',
    status: 'open',
    priority: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user1',
    team_id: undefined,
    assignee_id: undefined,
    attachments: []
  },
  {
    id: '2',
    title: 'Test Ticket 2',
    description: 'Test Description 2',
    status: 'closed',
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user2',
    team_id: undefined,
    assignee_id: undefined,
    attachments: []
  }
]

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('TicketList', () => {
  beforeEach(() => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: [],
      isLoading: false,
      error: null,
      totalCount: 0
    })
    vi.mocked(useAllTickets).mockReturnValue({
      tickets: [],
      isLoading: false,
      error: null,
      totalCount: 0
    })
  })

  it('renders loading state', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: [],
      isLoading: true,
      error: null,
      totalCount: 0
    })

    renderWithRouter(<TicketList />)
    
    const skeletons = screen.getAllByTestId('ticket-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error state', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: [],
      isLoading: false,
      error: new Error('Failed to fetch tickets'),
      totalCount: 0
    })

    renderWithRouter(<TicketList />)
    expect(screen.getByText(/failed to load tickets/i)).toBeInTheDocument()
  })

  it('renders tickets in normal view', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
      error: null,
      totalCount: mockTickets.length
    })

    renderWithRouter(<TicketList />)
    
    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument()
  })

  it('renders tickets in admin view', () => {
    vi.mocked(useAllTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
      error: null,
      totalCount: mockTickets.length
    })

    renderWithRouter(<TicketList isAdminView={true} />)
    
    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument()
  })

  it('handles ticket selection', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
      error: null,
      totalCount: mockTickets.length
    })

    const onSelectTicket = vi.fn()
    renderWithRouter(<TicketList selectedTickets={[]} onSelectTicket={onSelectTicket} />)
    
    const checkboxes = screen.getAllByRole('checkbox', { name: /select ticket/i })
    fireEvent.click(checkboxes[0])
    
    expect(onSelectTicket).toHaveBeenCalledWith('1')
  })

  it('handles "select all" functionality', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
      error: null,
      totalCount: mockTickets.length
    })

    const onSelectAll = vi.fn()
    renderWithRouter(
      <TicketList 
        selectedTickets={[]} 
        onSelectAll={onSelectAll}
      />
    )
    
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
    fireEvent.click(selectAllCheckbox)
    
    expect(onSelectAll).toHaveBeenCalledWith(mockTickets.map(t => t.id))
  })

  it('shows selected tickets', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
      error: null,
      totalCount: mockTickets.length
    })

    renderWithRouter(
      <TicketList 
        selectedTickets={['1']}
      />
    )
    
    const checkboxes = screen.getAllByRole('checkbox', { name: /select ticket/i })
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true')
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('displays empty state when no tickets', () => {
    vi.mocked(useTickets).mockReturnValue({
      tickets: [],
      isLoading: false,
      error: null,
      totalCount: 0
    })

    renderWithRouter(<TicketList />)
    expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
  })
}) 