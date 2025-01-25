import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Team } from '../../../types/models/team.types';
import type { PostgrestError } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

describe('Team Management Integration Tests', () => {
  // Test data
  const agent1Email = 'agent1@test.com';
  const agent2Email = 'agent2@test.com';
  const admin1Email = 'admin1@test.com';
  const customer1Email = 'customer1@test.com';
  let agent1Id: string;
  let agent2Id: string;
  let admin1Id: string;
  let customer1Id: string;
  let testTeam: Team;

  // Helper function to get user role
  async function getUserRoles(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error getting profile role:', profileError);
    }

    console.log('User role for', userId, ':', { profile });

    return {
      role: profile?.role
    };
  }

  // Helper function to verify database error
  function verifyError(error: PostgrestError | null, expectedMessage: string) {
    expect(error).not.toBeNull();
    if (error) {
      console.log('Actual error message:', error.message);
      expect(error.message).toContain(expectedMessage);
    } else {
      throw new Error('Expected error to be non-null');
    }
  }

  beforeAll(async () => {
    console.log('Looking for test users:', { agent1Email, agent2Email, admin1Email, customer1Email });

    // Get test user IDs from profiles table - one query per user for clarity
    const { data: agent1Profile, error: agent1Error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', agent1Email)
      .single();

    if (agent1Error) {
      console.error('Failed to get agent1:', agent1Error);
    }
    console.log('Agent1 lookup result:', { email: agent1Email, profile: agent1Profile });

    const { data: agent2Profile, error: agent2Error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', agent2Email)
      .single();

    if (agent2Error) {
      console.error('Failed to get agent2:', agent2Error);
    }
    console.log('Agent2 lookup result:', { email: agent2Email, profile: agent2Profile });

    const { data: admin1Profile, error: admin1Error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', admin1Email)
      .single();

    if (admin1Error) {
      console.error('Failed to get admin1:', admin1Error);
    }
    console.log('Admin1 lookup result:', { email: admin1Email, profile: admin1Profile });

    const { data: customer1Profile, error: customer1Error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customer1Email)
      .single();

    if (customer1Error) {
      console.error('Failed to get customer1:', customer1Error);
    }
    console.log('Customer1 lookup result:', { email: customer1Email, profile: customer1Profile });

    // Set the IDs
    agent1Id = agent1Profile?.id;
    agent2Id = agent2Profile?.id;
    admin1Id = admin1Profile?.id;
    customer1Id = customer1Profile?.id;

    console.log('Retrieved IDs:', { agent1Id, agent2Id, admin1Id, customer1Id });

    if (!agent1Id || !agent2Id || !admin1Id || !customer1Id) {
      console.error('Missing test users. Found:', { agent1Id, agent2Id, admin1Id, customer1Id });
      throw new Error('Test users not found. Please run create-test-users script first.');
    }

    // Clean up any existing test data
    const { data: existingTeams } = await supabase
      .from('teams')
      .select('id, name')
      .or('name.ilike.%Test Team%,name.ilike.%Admin Led Team%,name.ilike.%Invalid Team%,name.ilike.%Second Team%');

    if (existingTeams?.length) {
      console.log('Cleaning up existing teams:', existingTeams.map(t => t.name));
      // First delete team members
      await supabase
        .from('team_members')
        .delete()
        .in('team_id', existingTeams.map(t => t.id));

      // Then delete teams
      await supabase
        .from('teams')
        .delete()
        .in('id', existingTeams.map(t => t.id));
    }

    // Reset agent1's role to agent
    await supabase.from('profiles').update({ role: 'agent' }).eq('id', agent1Id);
  });

  afterAll(async () => {
    // Clean up test team if it exists
    if (testTeam?.id) {
      await supabase.from('teams').delete().eq('id', testTeam.id);
    }

    // Reset agent1's role back to agent if they were promoted
    const { data: agent1 } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', agent1Id)
      .single();

    if (agent1?.role === 'team_lead') {
      await supabase.from('profiles').update({ role: 'agent' }).eq('id', agent1Id);
    }
  });

  describe('Team Creation and Leadership', () => {
    it('should create a team with agent1 as team lead and update their role', async () => {
      // Create team with agent1 as lead
      const { data: team, error } = await supabase
        .from('teams')
        .insert({
          name: 'Test Team',
          description: 'Test team for integration tests',
          lead_id: agent1Id
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(team).not.toBeNull();
      if (!team) throw new Error('Failed to create team');
      testTeam = team;

      // Wait a moment for triggers to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify agent1's roles were updated
      const roles = await getUserRoles(agent1Id);
      expect(roles.role).toBe('team_lead');
    });

    it('should allow adding agents to the team', async () => {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: testTeam.id,
          user_id: agent2Id,
          role: 'agent'
        });

      expect(error).toBeNull();

      // Verify agent2's roles were not changed
      const roles = await getUserRoles(agent2Id);
      expect(roles.role).toBe('agent');
    });

    it('should allow adding admins to the team', async () => {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: testTeam.id,
          user_id: admin1Id,
          role: 'admin'
        });

      expect(error).toBeNull();

      // Verify admin's roles were not changed
      const roles = await getUserRoles(admin1Id);
      expect(roles.role).toBe('admin');
    });

    it('should not allow adding customers to the team', async () => {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: testTeam.id,
          user_id: customer1Id,
          role: 'customer'
        });

      verifyError(error, 'Customers cannot be team members');

      // Verify customer's roles were not changed
      const roles = await getUserRoles(customer1Id);
      expect(roles.role).toBe('customer');
    });
  });

  describe('Team Lead Role Restrictions', () => {
    it('should allow admins to lead teams without role downgrade', async () => {
      // Create a new team with admin as lead
      const { data: adminTeam, error } = await supabase
        .from('teams')
        .insert({
          name: 'Admin Led Team',
          description: 'Team led by admin',
          lead_id: admin1Id
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(adminTeam).not.toBeNull();
      if (!adminTeam) throw new Error('Failed to create admin team');

      // Wait a moment for triggers to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify admin's roles were not changed
      const roles = await getUserRoles(admin1Id);
      expect(roles.role).toBe('admin');

      // Clean up admin team
      await supabase.from('teams').delete().eq('id', adminTeam.id);
    });

    it('should not allow customers to be promoted to team lead', async () => {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: 'Invalid Team',
          description: 'Team with invalid lead',
          lead_id: customer1Id
        });

      verifyError(error, 'Customers cannot be team leads');

      // Verify customer's roles were not changed
      const roles = await getUserRoles(customer1Id);
      expect(roles.role).toBe('customer');
    });

    it('should enforce unique team membership', async () => {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: testTeam.id,
          user_id: agent2Id,
          role: 'agent'
        });

      verifyError(error, 'duplicate key value violates unique constraint');
    });

    it('should not allow a user to lead multiple teams', async () => {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: 'Second Team',
          description: 'Another team with same lead',
          lead_id: agent1Id
        });

      verifyError(error, 'A user can only lead one team at a time');
    });
  });
}); 