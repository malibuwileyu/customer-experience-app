/**
 * @fileoverview Ticket service for handling ticket operations
 * @module services/ticket
 */

import { supabase } from "../lib/supabase"
import type { 
  CreateTicketDTO,
  UpdateTicketDTO,
  CreateTicketCommentDTO,
  TicketComment,
  TicketFilters,
  TicketSort,
  TicketStatusHistory
} from '../types/models/ticket.types'
import type { Ticket } from '../types/tickets'

export interface PaginatedResponse<T> {
  data: T[]
  count: number
}

export const ticketService = {
  async createTicket(data: CreateTicketDTO): Promise<Ticket> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Extract internal notes and create metadata object
    const { internal_notes, ...ticketData } = data
    const metadata = internal_notes ? { internal_notes } : null

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        ...ticketData,
        metadata,
        created_by: user?.id,
        status: 'open'
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      throw error
    }

    return ticket
  },

  async getTicket(id: string): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      throw error
    }

    return data
  },

  async getTickets(filters?: TicketFilters, sort?: TicketSort, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Ticket>> {
    const start = (page - 1) * pageSize

    // Simple query to get tickets
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tickets:', error)
      throw error
    }

    // Handle pagination in memory
    const allTickets = data as Ticket[]
    const paginatedTickets = allTickets.slice(start, start + pageSize)

    return {
      data: paginatedTickets,
      count: allTickets.length
    }
  },

  async updateTicket(id: string, data: UpdateTicketDTO): Promise<Ticket> {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return ticket
  },

  async addTicketComment(data: CreateTicketCommentDTO): Promise<TicketComment> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: comment, error } = await supabase
      .from('ticket_comments')
      .insert({
        ...data,
        user_id: user?.id
      })
      .select()
      .single()

    if (error) throw error
    return comment
  },

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    const { data: comments, error } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!comments?.length) return []

    return comments.map(comment => ({
      ...comment,
      user: {
        id: comment.user_id,
        name: 'User',  // We can fetch user details separately if needed
        email: '',
        avatar_url: null
      }
    }))
  },

  async assignTicket(ticketId: string, userId: string): Promise<Ticket> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: ticket, error } = await supabase.rpc('assign_ticket', {
      p_ticket_id: ticketId,
      p_assigned_to: userId,
      p_assigned_by: user?.id
    })

    if (error) throw error
    return ticket
  },

  async updateTicketStatus(ticketId: string, status: Ticket['status']): Promise<Ticket> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: ticket, error } = await supabase.rpc('update_ticket_status', {
      p_ticket_id: ticketId,
      p_new_status: status,
      p_changed_by: user?.id
    })

    if (error) throw error
    return ticket
  },

  async getTicketStatusHistory(ticketId: string): Promise<TicketStatusHistory[]> {
    // First get the status history
    const { data: history, error: historyError } = await supabase
      .from('ticket_status_history')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('changed_at', { ascending: false })

    if (historyError) throw historyError
    if (!history?.length) return []

    // Then get the user profiles for all changed_by users
    const userIds = [...new Set(history.map(entry => entry.changed_by))]
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Create a map of user profiles for easy lookup
    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]))

    // Map the history entries to include user information
    return history.map(entry => ({
      ...entry,
      changed_by_user: {
        id: entry.changed_by,
        name: profileMap.get(entry.changed_by)?.full_name || 'Unknown',
        avatar_url: profileMap.get(entry.changed_by)?.avatar_url
      }
    }))
  },

  async deleteTicket(id: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const { getTickets } = ticketService
export default ticketService 