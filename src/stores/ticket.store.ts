/**
 * @fileoverview Ticket store for managing ticket state
 * @module stores/ticket
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  Ticket, 
  TicketComment,
  TicketFilters,
  TicketSort,
  CreateTicketDTO,
  UpdateTicketDTO,
  CreateTicketCommentDTO
} from '@/types/models/ticket.types'
import { ticketService } from '../services/ticket.service'

interface TicketStateData {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  comments: TicketComment[]
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isCommenting: boolean
  error: Error | null
  filters: Partial<TicketFilters>
  sort: TicketSort
}

interface TicketActions {
  setFilters: (filters: TicketFilters) => void
  setSort: (sort: TicketSort) => void
  clearFilters: () => void
  fetchTickets: () => Promise<void>
  fetchTicketById: (id: string) => Promise<void>
  createTicket: (data: CreateTicketDTO) => Promise<void>
  updateTicket: (id: string, data: UpdateTicketDTO) => Promise<void>
  assignTicket: (ticketId: string, userId: string) => Promise<void>
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>
  fetchComments: (ticketId: string) => Promise<void>
  addComment: (data: CreateTicketCommentDTO) => Promise<void>
  reset: () => void
}

type TicketState = TicketStateData & TicketActions

const initialState: TicketStateData = {
  tickets: [],
  comments: [],
  selectedTicket: null,
  filters: {},
  sort: {
    field: 'created_at',
    direction: 'desc'
  } as TicketSort,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isCommenting: false,
  error: null
}

export const useTicketStore = create<TicketState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Filter and sort actions
      setFilters: (filters) => set({ filters }),
      setSort: (sort) => set({ sort }),
      clearFilters: () => set({ filters: {} }),

      // Ticket operations
      fetchTickets: async () => {
        try {
          set({ isLoading: true, error: null })
          const tickets = await ticketService.getTickets(get().filters, get().sort)
          set({ tickets, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      fetchTicketById: async (id) => {
        try {
          set({ isLoading: true, error: null })
          const ticket = await ticketService.getTicket(id)
          set({ selectedTicket: ticket, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      createTicket: async (data) => {
        try {
          set({ isCreating: true, error: null })
          const ticket = await ticketService.createTicket(data)
          set((state) => ({ 
            tickets: [ticket, ...state.tickets],
            isCreating: false 
          }))
        } catch (error) {
          set({ error: error as Error, isCreating: false })
        }
      },

      updateTicket: async (id, data) => {
        try {
          set({ isUpdating: true, error: null })
          const ticket = await ticketService.updateTicket(id, data)
          set((state) => ({
            tickets: state.tickets.map((t) => (t.id === id ? ticket : t)),
            selectedTicket: state.selectedTicket?.id === id ? ticket : state.selectedTicket,
            isUpdating: false
          }))
        } catch (error) {
          set({ error: error as Error, isUpdating: false })
        }
      },

      assignTicket: async (ticketId, userId) => {
        try {
          set({ isUpdating: true, error: null })
          const ticket = await ticketService.assignTicket(ticketId, userId)
          set((state) => ({
            tickets: state.tickets.map((t) => (t.id === ticketId ? ticket : t)),
            selectedTicket: state.selectedTicket?.id === ticketId ? ticket : state.selectedTicket,
            isUpdating: false
          }))
        } catch (error) {
          set({ error: error as Error, isUpdating: false })
        }
      },

      updateTicketStatus: async (ticketId, status) => {
        try {
          set({ isUpdating: true, error: null })
          const ticket = await ticketService.updateTicketStatus(ticketId, status)
          set((state) => ({
            tickets: state.tickets.map((t) => (t.id === ticketId ? ticket : t)),
            selectedTicket: state.selectedTicket?.id === ticketId ? ticket : state.selectedTicket,
            isUpdating: false
          }))
        } catch (error) {
          set({ error: error as Error, isUpdating: false })
        }
      },

      // Comment operations
      fetchComments: async (ticketId) => {
        try {
          set({ isLoading: true, error: null })
          const comments = await ticketService.getTicketComments(ticketId)
          set({ comments, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      addComment: async (data) => {
        try {
          set({ isCommenting: true, error: null })
          const comment = await ticketService.addTicketComment(data)
          set((state) => ({ 
            comments: [...state.comments, comment],
            isCommenting: false 
          }))
        } catch (error) {
          set({ error: error as Error, isCommenting: false })
        }
      },

      // Reset state
      reset: () => set(initialState)
    }),
    { name: 'ticket-store' }
  )
)
