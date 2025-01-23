/**
 * @fileoverview Ticket types and interfaces
 * @module types/models/ticket
 */

import type { Database } from '@/types/database.types'

// Database types
type DBTicketComment = Database['public']['Tables']['ticket_comments']['Row']
type DBTicketStatusHistory = Database['public']['Tables']['ticket_status_history']['Row']
type DBTicketAssignmentHistory = Database['public']['Tables']['ticket_assignment_history']['Row']

// Enums
export const TICKET_STATUS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const TICKET_PRIORITY: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

// Types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// Main interfaces
export interface Ticket {
  id: string
  title: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  created_at: string
  updated_at: string
  created_by: string
  assignee_id?: string
  category_id?: string
  team_id?: string
  internal_notes?: string
  attachments?: string[]
  tags?: string[]
  category?: {
    id: string
    name: string
  }
  team?: {
    id: string
    name: string
  }
  assigned_to?: {
    id: string
    full_name: string
    avatar_url?: string | null
  }
  created_by_user?: {
    id: string
    full_name: string
    avatar_url?: string | null
  }
}

export interface TicketComment extends Omit<DBTicketComment, 'user_id'> {
  user: {
    id: string
    name: string
    email: string
    avatar_url?: string | null
  }
}

export interface TicketStatusHistory extends Omit<DBTicketStatusHistory, 'changed_by'> {
  changed_by_user: {
    id: string
    name: string
    avatar_url?: string | null
  }
}

export interface TicketAssignmentHistory extends Omit<DBTicketAssignmentHistory, 'assigned_by' | 'old_assignee' | 'new_assignee'> {
  assigned_by_user: {
    id: string
    name: string
  }
  old_assignee?: {
    id: string
    name: string
  }
  new_assignee: {
    id: string
    name: string
  }
}

// DTO types
export interface CreateTicketDTO {
  title: string
  description: string
  priority: TicketPriority
  category_id?: string
  team_id?: string
  assignee_id?: string
  internal_notes?: string
  attachments?: string[]
  tags?: string[]
}

export interface UpdateTicketDTO {
  title?: string
  description?: string
  priority?: TicketPriority
  status?: TicketStatus
  category_id?: string
  team_id?: string
  assignee_id?: string
  internal_notes?: string
  attachments?: string[]
  tags?: string[]
}

export interface CreateTicketCommentDTO {
  ticket_id: string
  content: string
  is_internal: boolean
}

// Filter and sort types
export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  team_id?: string
  category_id?: string
  tags?: string[]
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface TicketSort {
  field: keyof Ticket
  direction: 'asc' | 'desc'
}

export interface TicketState {
  tickets: Ticket[]
  comments: TicketComment[]
  selectedTicket: Ticket | null
  filters: Partial<TicketFilters>
  sort: TicketSort
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isCommenting: boolean
  error: Error | null
} 