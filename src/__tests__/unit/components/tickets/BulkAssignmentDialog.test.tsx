import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BulkAssignmentDialog } from '../../../../components/tickets/BulkAssignmentDialog'
import { ticketService } from '../../../../services/ticket.service'
import { toast } from 'sonner'
import { useTeams } from '../../../../hooks/teams/use-teams'
import { useProfile } from '../../../../hooks/auth/use-profile'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}))

vi.mock('../../../../services/ticket.service', () => ({
  ticketService: {
    assignTeam: vi.fn()
  }
}))

vi.mock('../../../../hooks/teams/use-teams', () => ({
  useTeams: vi.fn()
}))

vi.mock('../../../../hooks/auth/use-profile', () => ({
  useProfile: vi.fn()
}))

describe('BulkAssignmentDialog', () => {
  const mockTicketIds = ['1', '2', '3']
  const mockOnClose = vi.fn()
  const mockOnUpdate = vi.fn()
  const mockTeams = [
    { 
      id: 'team1', 
      name: 'Team 1',
      description: 'Test team 1',
      lead_id: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 'team2', 
      name: 'Team 2',
      description: 'Test team 2',
      lead_id: 'user2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTeams).mockReturnValue({
      teams: mockTeams,
      isLoading: false,
      error: null
    })
    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: 'user1',
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin',
        team_id: 'team1'
      },
      isLoading: false,
      error: null
    })
  })

  it('renders the dialog with team options', () => {
    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Assign Tickets')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    
    // Verify team options are rendered
    mockTeams.forEach(team => {
      expect(screen.getByText(team.name)).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching teams', () => {
    vi.mocked(useTeams).mockReturnValue({
      teams: [],
      isLoading: true,
      error: null
    })

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByTestId('team-select-loading')).toBeInTheDocument()
  })

  it('shows error state when teams fetch fails', () => {
    vi.mocked(useTeams).mockReturnValue({
      teams: [],
      isLoading: false,
      error: new Error('Failed to fetch teams')
    })

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText(/failed to load teams/i)).toBeInTheDocument()
  })

  it('handles successful team assignment for single ticket', async () => {
    vi.mocked(ticketService.assignTeam).mockResolvedValueOnce({
      id: '1',
      title: 'Test Ticket',
      description: 'Test Description',
      status: 'open',
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user1'
    })

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={['1']}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a team
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'team1' } })

    // Click assign button
    fireEvent.click(screen.getByText('Assign'))

    await waitFor(() => {
      expect(ticketService.assignTeam).toHaveBeenCalledWith(['1'], 'team1')
      expect(toast.success).toHaveBeenCalledWith('Successfully assigned 1 ticket')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles successful team assignment for multiple tickets', async () => {
    vi.mocked(ticketService.assignTeam).mockResolvedValueOnce({
      id: '1',
      title: 'Test Ticket',
      description: 'Test Description',
      status: 'open',
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user1'
    })

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a team
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'team2' } })

    // Click assign button
    fireEvent.click(screen.getByText('Assign'))

    await waitFor(() => {
      expect(ticketService.assignTeam).toHaveBeenCalledWith(mockTicketIds, 'team2')
      expect(toast.success).toHaveBeenCalledWith('Successfully assigned 3 tickets')
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles failed team assignment', async () => {
    const error = new Error('Failed to assign team')
    vi.mocked(ticketService.assignTeam).mockRejectedValueOnce(error)

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a team
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'team1' } })

    // Click assign button
    fireEvent.click(screen.getByText('Assign'))

    await waitFor(() => {
      expect(ticketService.assignTeam).toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Failed to assign tickets')
      expect(mockOnUpdate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('shows loading state during assignment', async () => {
    vi.mocked(ticketService.assignTeam).mockImplementationOnce(() => new Promise(() => {}))

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a team
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'team1' } })

    // Click assign button
    fireEvent.click(screen.getByText('Assign'))

    expect(screen.getByText('Assigning...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assigning...' })).toBeDisabled()
  })

  it('disables assign button when no team is selected', () => {
    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByRole('button', { name: 'Assign' })).toBeDisabled()
  })

  it('enables assign button when team is selected', () => {
    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Select a team
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'team1' } })

    expect(screen.getByRole('button', { name: 'Assign' })).not.toBeDisabled()
  })

  it('closes when cancel is clicked', () => {
    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('restricts team selection based on user role', () => {
    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: 'user1',
        email: 'teamlead1@example.com',
        full_name: 'Team Lead One',
        role: 'team_lead',
        team_id: 'team1'
      },
      isLoading: false,
      error: null
    })

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Only the user's team should be available
    expect(screen.getByText('Team 1')).toBeInTheDocument()
    expect(screen.queryByText('Team 2')).not.toBeInTheDocument()
  })

  it('shows team lead specific options', () => {
    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: 'user2',
        email: 'teamlead@example.com',
        full_name: 'Team Lead User',
        role: 'team_lead',
        team_id: 'team2'
      },
      isLoading: false,
      error: null
    })

    render(
      <BulkAssignmentDialog
        isOpen={true}
        onClose={mockOnClose}
        ticketIds={mockTicketIds}
        onUpdate={mockOnUpdate}
      />
    )

    // Only the user's team should be available
    expect(screen.getByText('Team 2')).toBeInTheDocument()
    expect(screen.queryByText('Team 1')).not.toBeInTheDocument()
  })
}) 