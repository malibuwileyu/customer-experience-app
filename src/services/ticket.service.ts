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
  TicketStatusHistory,
  Ticket
} from '../types/models/ticket.types'

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
    console.log('Fetching ticket with ID:', id);
    
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      throw error
    }

    console.log('Raw ticket data:', data);
    console.log('Raw attachments:', data.attachments);

    // Ensure attachments is always an array of strings
    const attachments = Array.isArray(data.attachments) ? data.attachments : [];
    console.log('Processed attachments:', attachments);

    return {
      ...data,
      attachments
    }
  },

  async getAllTickets(): Promise<PaginatedResponse<Ticket>> {
    console.log('getAllTickets: Fetching all tickets without filtering')
    
    // Get all tickets without any filtering, using service role to bypass RLS
    const { data: { user } } = await supabase.auth.getUser()
    console.log('getAllTickets: Current user:', user)

    // Use service role client to bypass RLS
    const { data, error, count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })


    if (error) {
      console.error('Error fetching all tickets:', error)
      throw error
    }

    console.log('getAllTickets: Raw response:', { data, count })

    return {
      data: data || [],
      count: count || 0
    }
  },

  async getTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
    console.log('Fetching tickets with filters:', filters);
    
    // Check if user is admin/agent
    const { data: { user } } = await supabase.auth.getUser()
    const isAdminOrAgent = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'agent'
    console.log('Role check in getTickets:', { user, isAdminOrAgent })
    
    // If admin/agent, return all tickets without filtering
    if (isAdminOrAgent) {
      console.log('User is admin/agent, fetching all tickets')
      const result = await this.getAllTickets()
      console.log('Got all tickets:', result)
      return result
    }
    
    // Otherwise, continue with filtered query
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tickets:', error)
      throw error
    }

    let filteredTickets = data as Ticket[]

    // Apply filters in memory
    if (filters) {
      if (filters.status) {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status)
      }
      if (filters.priority) {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === filters.priority)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.title.toLowerCase().includes(searchLower) || 
          ticket.description.toLowerCase().includes(searchLower)
        )
      }
    }

    return {
      data: filteredTickets,
      count: filteredTickets.length
    }
  },

  async updateTicket(id: string, data: UpdateTicketDTO): Promise<Ticket> {
    // If we're updating attachments, use the special function
    if ('attachments' in data) {
      const { data: ticket, error } = await supabase
        .rpc('update_ticket_attachments', {
          p_ticket_id: id,
          p_attachments: data.attachments
        })

      if (error) {
        console.error('Error updating ticket attachments:', error)
        throw error
      }
      return ticket
    }

    // Otherwise use normal update
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(data)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      throw error
    }
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
  },

  async getUserTickets(page = 1, pageSize = 10): Promise<PaginatedResponse<Ticket>> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error, count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      console.error('Error fetching user tickets:', error)
      throw error
    }

    return {
      data: data || [],
      count: count || 0
    }
  },

  async getUserTicketDetails(id: string): Promise<Ticket> {
    console.log('Getting user ticket details for ticket:', id)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }
    
    if (!user) {
      console.error('No user found in getUserTicketDetails')
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user ticket:', error)
      throw error
    }

    if (!data) {
      console.error('No ticket found:', id)
      throw new Error('Ticket not found')
    }

    console.log('Successfully fetched ticket:', data)
    return data
  }
}

export default ticketService 