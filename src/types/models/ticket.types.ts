/**
 * @fileoverview Ticket system type definitions
 * @module types/models/ticket
 */

import { Database } from '../database.types'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
  created_by: string
  assigned_to?: string
  category?: string
  tags?: string[]
  attachments?: string[]
}

export interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  assignedTo?: string
  category?: string
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

export interface CreateTicketDTO {
  title: string
  description: string
  priority: TicketPriority
  category?: string
  tags?: string[]
  attachments?: string[]
}

export interface UpdateTicketDTO extends Partial<CreateTicketDTO> {
  status?: TicketStatus
  assigned_to?: string
}

// Database types
export type TicketRow = Database['public']['Tables']['tickets']['Row']
export type TicketInsert = Database['public']['Tables']['tickets']['Insert']
export type TicketUpdate = Database['public']['Tables']['tickets']['Update'] 