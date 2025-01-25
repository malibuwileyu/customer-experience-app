/**
 * @fileoverview Team service for handling team operations
 * @module services/team
 */

import { supabase, serviceClient } from "../lib/supabase"
import type { 
  Team,
  TeamMember,
  CreateTeamDTO,
  UpdateTeamDTO,
  AddTeamMemberDTO,
  TeamRow,
  TeamInsert,
  TeamUpdate,
  TeamMemberRow,
  TeamMemberInsert
} from '../types/models/team.types'
import { User } from "@/types/models/user.types"

export const teamService = {
  /**
   * Create a new team
   * 
   * @async
   * @param {CreateTeamDTO} data - Team creation data
   * @returns {Promise<Team>} Created team
   * @throws {Error} If team creation fails
   */
  async createTeam(data: CreateTeamDTO): Promise<Team> {
    // First check if the user is already a team lead
    const { data: existingTeam, error: checkError } = await serviceClient
      .from("teams")
      .select()
      .eq("lead_id", data.lead_id)
      .maybeSingle();

    if (checkError) {
      console.error('Failed to check existing team lead:', checkError);
      throw checkError;
    }

    if (existingTeam) {
      throw new Error('The selected user is already a team lead for another team');
    }

    const { data: team, error } = await serviceClient
      .from("teams")
      .insert(data as TeamInsert)
      .select()
      .single()

    if (error) {
      console.error('Failed to create team:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create team: ${error.message}`);
    }
    return team as Team
  },

  /**
   * Check if a user is already a team lead
   * 
   * @async
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>} Whether the user is already a team lead
   */
  async isUserTeamLead(userId: string): Promise<boolean> {
    const { data, error } = await serviceClient
      .from("teams")
      .select()
      .eq("lead_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to check team lead status:', error);
      throw error;
    }

    return !!data;
  },

  /**
   * Get all teams
   * 
   * @async
   * @returns {Promise<Team[]>} Array of teams
   * @throws {Error} If fetch fails
   */
  async getTeams(): Promise<Team[]> {
    const { data: teams, error } = await serviceClient
      .from("teams")
      .select()
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Failed to fetch teams:', error);
      throw new Error("Failed to fetch teams");
    }
    return (teams || []) as Team[]
  },

  /**
   * Get a team by ID
   * 
   * @async
   * @param {string} id - Team ID
   * @returns {Promise<Team>} Team data
   * @throws {Error} If team not found or fetch fails
   */
  async getTeam(id: string): Promise<Team> {
    const { data: team, error } = await serviceClient
      .from("teams")
      .select()
      .eq("id", id)
      .single()

    if (error) {
      console.error('Failed to fetch team:', error);
      throw new Error("Team not found");
    }

    // Get team members separately
    const { data: members, error: membersError } = await serviceClient
      .from("team_members")
      .select()
      .eq("team_id", id)

    if (membersError) {
      console.error('Failed to fetch team members:', membersError);
      throw new Error("Failed to fetch team members");
    }

    if (!members?.length) {
      return {
        ...team,
        members: []
      } as Team;
    }

    // Get user profiles for all members
    const { data: profiles, error: profilesError } = await serviceClient
      .from("profiles")
      .select("id, full_name, email, role")
      .in("id", members.map(m => m.user_id))

    if (profilesError) {
      console.error('Failed to fetch member profiles:', profilesError);
      throw new Error("Failed to fetch member profiles");
    }

    // Combine member data with user profiles
    const membersWithProfiles = members.map(member => ({
      ...member,
      user: profiles?.find(p => p.id === member.user_id)
    }));

    return {
      ...team,
      members: membersWithProfiles
    } as Team;
  },

  /**
   * Update a team
   * 
   * @async
   * @param {string} id - Team ID
   * @param {UpdateTeamDTO} data - Team update data
   * @returns {Promise<Team>} Updated team
   * @throws {Error} If update fails
   */
  async updateTeam(id: string, data: UpdateTeamDTO): Promise<Team> {
    const { data: team, error } = await serviceClient
      .from("teams")
      .update(data as TeamUpdate)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error("Failed to update team")
    return team as Team
  },

  /**
   * Delete a team
   * 
   * @async
   * @param {string} id - Team ID
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  async deleteTeam(id: string): Promise<void> {
    const { error } = await serviceClient
      .from("teams")
      .delete()
      .eq("id", id)

    if (error) throw new Error("Failed to delete team")
  },

  /**
   * Add a member to a team
   * 
   * @async
   * @param {AddTeamMemberDTO} data - Team member data
   * @returns {Promise<TeamMember>} Created team member
   * @throws {Error} If member addition fails
   */
  async addTeamMember(data: AddTeamMemberDTO): Promise<TeamMember> {
    const { data: member, error } = await serviceClient
      .from("team_members")
      .insert(data as TeamMemberInsert)
      .select()
      .single()

    if (error) {
      // Handle duplicate member case
      if (error.code === '23505') {
        throw new Error("User is already a member of this team")
      }
      console.error('Failed to add team member:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error("Failed to add team member")
    }
    return member as TeamMember
  },

  /**
   * Remove a member from a team
   * 
   * @async
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   * @throws {Error} If member removal fails
   */
  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const { error } = await serviceClient
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId)

    if (error) throw new Error("Failed to remove team member")
  },

  /**
   * Get all members of a team
   * 
   * @async
   * @param {string} teamId - Team ID
   * @returns {Promise<TeamMember[]>} Array of team members with user details
   * @throws {Error} If fetch fails
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    // First get team members
    const { data: members, error } = await serviceClient
      .from("team_members")
      .select()
      .eq("team_id", teamId)

    if (error) {
      console.error('Failed to fetch team members:', error);
      throw new Error("Failed to fetch team members");
    }

    if (!members?.length) return [];

    // Then get user profiles for each member
    const { data: profiles, error: profilesError } = await serviceClient
      .from("profiles")
      .select("id, full_name, email, role")
      .in("id", members.map(m => m.user_id))

    if (profilesError) {
      console.error('Failed to fetch member profiles:', profilesError);
      throw new Error("Failed to fetch member profiles");
    }

    // Combine member data with user profiles
    return members.map(member => ({
      ...member,
      user: profiles?.find(p => p.id === member.user_id)
    })) as TeamMember[]
  }
}

export default teamService 