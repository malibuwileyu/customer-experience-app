/**
 * @fileoverview Team middleware for handling team-specific access control and validation
 * @module middleware/team
 */

import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export const teamMiddleware = {
  /**
   * Validates if the authenticated user has access to the specified team
   * 
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   */
  async validateTeamAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const teamId = req.params.teamId
      if (!teamId) {
        return res.status(400).json({ error: 'Team ID required' })
      }

      const { data: members, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error checking team access:', error)
        return res.status(500).json({ error: 'Internal server error' })
      }

      if (!members?.length) {
        return res.status(403).json({ error: 'Access denied' })
      }

      next()
    } catch (error) {
      console.error('Error in validateTeamAccess:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  /**
   * Validates if the authenticated user has the required role in the team
   * 
   * @param {string[]} allowedRoles - Array of roles that are allowed to access
   * @returns {Function} Express middleware function
   */
  validateTeamRole(allowedRoles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          return res.status(401).json({ error: 'Not authenticated' })
        }

        const teamId = req.params.teamId
        if (!teamId) {
          return res.status(400).json({ error: 'Team ID required' })
        }

        const { data: members, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', teamId)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error checking team role:', error)
          return res.status(500).json({ error: 'Internal server error' })
        }

        const member = members?.[0]
        if (!member || !allowedRoles.includes(member.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' })
        }

        next()
      } catch (error) {
        console.error('Error in validateTeamRole:', error)
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  /**
   * Validates team operation payloads (create/update)
   * 
   * @param {'create' | 'update'} operation - Type of operation to validate
   * @returns {Function} Express middleware function
   */
  validateTeamOperation(operation: 'create' | 'update') {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = req.body

        if (operation === 'create') {
          if (!data.name) {
            return res.status(400).json({ error: 'Invalid team data' })
          }
        } else if (operation === 'update') {
          if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'No update data provided' })
          }
        }

        next()
      } catch (error) {
        console.error(`Error in validateTeamOperation(${operation}):`, error)
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }
}

export default teamMiddleware 