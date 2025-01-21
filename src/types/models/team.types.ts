/**
 * @fileoverview Team and team member type definitions
 * @module types/models/team
 */

import { Database } from '../database.types'

export interface Team {
  id: string
  name: string
  description?: string
  lead_id?: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'admin' | 'agent' | 'team_lead' | 'customer'
  created_at: string
  updated_at: string
}

export interface CreateTeamDTO {
  name: string
  description?: string
  lead_id?: string
}

export interface UpdateTeamDTO extends Partial<CreateTeamDTO> {}

export interface AddTeamMemberDTO {
  team_id: string
  user_id: string
  role: 'admin' | 'agent' | 'team_lead' | 'customer'
}

// Database types
export type TeamRow = Database['public']['Tables']['teams']['Row']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']

export type TeamMemberRow = Database['public']['Tables']['team_members']['Row']
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'] 