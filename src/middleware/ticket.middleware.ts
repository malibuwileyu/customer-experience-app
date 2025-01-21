/**
 * @fileoverview Ticket middleware for validating and authorizing ticket operations
 * @module middleware/ticket
 * @description
 * Provides middleware functions for ticket-related operations including
 * validation, permission checks, and SLA enforcement.
 */

import { Request, Response, NextFunction } from 'express'
import { PermissionError } from './permission.middleware'
import { requirePermission } from './permission.middleware'
import { TICKET_PRIORITY, TICKET_STATUS } from '../types/models/ticket.types'

/**
 * Configuration options for ticket operation validation
 */
export type TicketValidationOptions = {
  requireAssignee?: boolean
  requireTeam?: boolean
  requireCategory?: boolean
  checkSLA?: boolean
}

/**
 * Middleware to validate ticket creation data
 */
export const validateTicketCreation = (options: TicketValidationOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, priority, team_id, category_id, assignee_id } = req.body

      if (!title?.trim()) {
        throw new Error('Title is required')
      }

      if (!description?.trim()) {
        throw new Error('Description is required')
      }

      if (priority && !Object.values(TICKET_PRIORITY).includes(priority)) {
        throw new Error('Invalid priority value')
      }

      if (options.requireTeam && !team_id) {
        throw new Error('Team ID is required')
      }

      if (options.requireCategory && !category_id) {
        throw new Error('Category ID is required')
      }

      if (options.requireAssignee && !assignee_id) {
        throw new Error('Assignee ID is required')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Middleware to validate ticket update data
 */
export const validateTicketUpdate = (options: TicketValidationOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { priority, status, team_id, category_id, assignee_id } = req.body

      if (priority && !Object.values(TICKET_PRIORITY).includes(priority)) {
        throw new Error('Invalid priority value')
      }

      if (status && !Object.values(TICKET_STATUS).includes(status)) {
        throw new Error('Invalid status value')
      }

      if (options.requireTeam && team_id === undefined) {
        throw new Error('Team ID is required')
      }

      if (options.requireCategory && category_id === undefined) {
        throw new Error('Category ID is required')
      }

      if (options.requireAssignee && assignee_id === undefined) {
        throw new Error('Assignee ID is required')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Middleware to check if user can access a ticket
 */
export const canAccessTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const ticketId = req.params.ticketId

    if (!userId) {
      throw new PermissionError('User not authenticated')
    }

    // Check if user has admin access
    const hasAdminAccess = await requirePermission(userId, 'ticket:admin', { throwError: false })
    if (hasAdminAccess) {
      return next()
    }

    // Check if user is ticket creator, assignee, or team member
    const ticket = await req.supabase
      .from('tickets')
      .select('created_by, assignee_id, team_id')
      .eq('id', ticketId)
      .single()

    if (!ticket.data) {
      throw new Error('Ticket not found')
    }

    if (
      ticket.data.created_by === userId ||
      ticket.data.assignee_id === userId
    ) {
      return next()
    }

    // Check team membership if ticket has a team
    if (ticket.data.team_id) {
      const teamMember = await req.supabase
        .from('team_members')
        .select('id')
        .eq('team_id', ticket.data.team_id)
        .eq('user_id', userId)
        .single()

      if (teamMember.data) {
        return next()
      }
    }

    throw new PermissionError('User does not have access to this ticket')
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware to check if user can manage a ticket
 */
export const canManageTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const ticketId = req.params.ticketId

    if (!userId) {
      throw new PermissionError('User not authenticated')
    }

    // Check if user has admin access
    const hasAdminAccess = await requirePermission(userId, 'ticket:admin', { throwError: false })
    if (hasAdminAccess) {
      return next()
    }

    // Check if user is assignee or team lead
    const ticket = await req.supabase
      .from('tickets')
      .select(`
        assignee_id,
        team_id,
        teams (
          lead_id
        )
      `)
      .eq('id', ticketId)
      .single()

    if (!ticket.data) {
      throw new Error('Ticket not found')
    }

    if (
      ticket.data.assignee_id === userId ||
      ticket.data.teams?.lead_id === userId
    ) {
      return next()
    }

    throw new PermissionError('User does not have permission to manage this ticket')
  } catch (error) {
    next(error)
  }
} 