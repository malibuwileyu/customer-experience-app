import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketList } from '../ticket-list'
import { useTickets } from '../../../hooks/tickets/use-tickets'
import { BrowserRouter } from 'react-router-dom'

// Mock the custom hook
vi.mock('../../../hooks/tickets/use-tickets', () => ({
  useTickets: vi.fn()
}))

const mockTickets = [
  {
    id: '1',
    title: 'Test Ticket 1',
    description: 'Test Description 1',
    status: 'open',
    priority: 'high',
    created_at: '2024-01-21T12:00:00Z',
    updated_at: '2024-01-21T12:00:00Z'
  },
  {
    id: '2',
    title: 'Test Ticket 2',
    description: 'Test Description 2',
    status: 'in_progress',
    priority: 'medium',
    created_at: '2024-01-21T13:00:00Z',
    updated_at: '2024-01-21T13:00:00Z'
  }
]

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter })
}

describe('TicketList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementation
    vi.mocked(useTickets).mockReturnValue({
      data: [],
      isPending: false,
      error: null
    } as any)
  })

  it('renders loading state', () => {
    vi.mocked(useTickets).mockReturnValue({
      data: undefined,
      isPending: true,
      error: null
    } as any)

    renderWithRouter(<TicketList />)
    
    // Check for loading skeleton
    expect(screen.getAllByTestId('ticket-skeleton')).toHaveLength(3)
  })

  it('renders error state', () => {
    vi.mocked(useTickets).mockReturnValue({
      data: undefined,
      isPending: false,
      error: new Error('Failed to load tickets')
    } as any)

    renderWithRouter(<TicketList />)
    expect(screen.getByText('Failed to load tickets')).toBeDefined()
  })

  it('renders empty state', () => {
    vi.mocked(useTickets).mockReturnValue({
      data: [],
      isPending: false,
      error: null
    } as any)

    renderWithRouter(<TicketList />)
    expect(screen.getByText('No tickets found')).toBeDefined()
  })

  it('renders list of tickets', () => {
    vi.mocked(useTickets).mockReturnValue({
      data: mockTickets,
      isPending: false,
      error: null
    } as any)

    renderWithRouter(<TicketList />)
    
    expect(screen.getByText('Test Ticket 1')).toBeDefined()
    expect(screen.getByText('Test Ticket 2')).toBeDefined()
  })

  it('filters tickets by status', async () => {
    const user = userEvent.setup()
    vi.mocked(useTickets).mockReturnValue({
      data: [mockTickets[0]], // Only return the 'open' ticket
      isPending: false,
      error: null
    } as any)

    renderWithRouter(<TicketList />)
    
    const statusSelect = screen.getByRole('combobox', { name: /filter by status/i })
    await user.click(statusSelect)
    await user.click(screen.getByText('Open'))

    expect(screen.getByText('Test Ticket 1')).toBeDefined()
    expect(screen.queryByText('Test Ticket 2')).toBe(null)
  })

  it('filters tickets by priority', async () => {
    const user = userEvent.setup()
    vi.mocked(useTickets).mockReturnValue({
      data: [mockTickets[0]], // Only return the 'high' priority ticket
      isPending: false,
      error: null
    } as any)

    renderWithRouter(<TicketList />)
    
    const prioritySelect = screen.getByRole('combobox', { name: /filter by priority/i })
    await user.click(prioritySelect)
    await user.click(screen.getByText('High'))

    expect(screen.getByText('Test Ticket 1')).toBeDefined()
    expect(screen.queryByText('Test Ticket 2')).toBe(null)
  })

  it('searches tickets', async () => {
    const user = userEvent.setup()
    vi.mocked(useTickets).mockReturnValue({
      data: [mockTickets[0]], // Only return the first ticket
      isPending: false,
      error: null
    } as any)

    renderWithRouter(<TicketList />)
    
    const searchInput = screen.getByRole('textbox', { name: /search tickets/i })
    await user.type(searchInput, 'Test Ticket 1')

    expect(screen.getByText('Test Ticket 1')).toBeDefined()
    expect(screen.queryByText('Test Ticket 2')).toBe(null)
  })
}) 