/**
 * @fileoverview Ticket service for handling ticket operations
 * @module services/ticket
 */

import { supabase } from "../lib/supabase"
import type { 
  CreateTicketDTO, 
  UpdateTicketDTO, 
  Ticket,
  CreateTicketCommentDTO,
  TicketComment,
  TicketFilters,
  TicketSort
} from '@/types/models/ticket.types'

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
      .select()
      .single()

    if (error) throw error
    return ticket
  },

  async getTicket(id: string): Promise<Ticket> {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by:profiles!tickets_created_by_fkey(id, full_name, avatar_url),
        assigned_to:profiles!tickets_assigned_to_fkey(id, full_name, avatar_url),
        team:teams(id, name),
        category:categories(id, name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return ticket
  },

  async getTickets(filters?: TicketFilters, sort?: TicketSort): Promise<Ticket[]> {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        created_by:profiles!tickets_created_by_fkey(id, full_name, avatar_url),
        assigned_to:profiles!tickets_assigned_to_fkey(id, full_name, avatar_url),
        team:teams(id, name),
        category:categories(id, name)
      `)

    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
      if (filters.team_id) {
        query = query.eq('team_id', filters.team_id)
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters.tags?.length) {
        query = query.contains('tags', filters.tags)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end)
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: tickets, error } = await query

    if (error) throw error
    return tickets
  },

  async updateTicket(id: string, data: UpdateTicketDTO): Promise<Ticket> {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(data)
      .eq('id', id)
      .select()
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
      .select(`
        *,
        user:profiles!ticket_comments_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return comments
  },

  async assignTicket(ticketId: string, userId: string): Promise<Ticket> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Start a transaction
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

    // Start a transaction
    const { data: ticket, error } = await supabase.rpc('update_ticket_status', {
      p_ticket_id: ticketId,
      p_new_status: status,
      p_changed_by: user?.id
    })

    if (error) throw error
    return ticket
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