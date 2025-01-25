/**
 * @fileoverview Team and team member type definitions
 * @module types/models/team
 */

import type { Database } from "../database.types"
import type { User } from "./user.types"

// Database types
export type TeamRow = Database["public"]["Tables"]["teams"]["Row"]
export type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"]
export type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"]

export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"]
export type TeamMemberInsert = Database["public"]["Tables"]["team_members"]["Insert"]

export interface TeamMember extends TeamMemberRow {
  user?: User
}

export interface Team extends TeamRow {
  lead?: User
  members?: TeamMember[]
}

// DTOs that map to database types
export type CreateTeamDTO = {
  name: string
  description?: string
  lead_id: string
}

export type UpdateTeamDTO = {
  name?: string
  description?: string
  lead_id?: string
}

export type AddTeamMemberDTO = {
  team_id: string
  user_id: string
  role: string
} 