import { createClient } from '@supabase/supabase-js';
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

async function getTestUsers() {
  // Get all test users
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .or('email.ilike.%test.com,email.ilike.%example.com');

  if (error) {
    console.error('Error fetching test users:', error);
    throw error;
  }

  // Group users by role
  const users = {
    admins: profiles.filter(p => p.role === 'admin'),
    agents: profiles.filter(p => p.role === 'agent'),
    customers: profiles.filter(p => p.role === 'customer')
  };

  return users;
}

async function createTestTeams() {
  console.log('Setting up test teams...');

  try {
    const users = await getTestUsers();

    // Clean up any existing test teams
    const { data: existingTeams } = await supabase
      .from('teams')
      .select('id, name')
      .or('name.ilike.%Test Team%,name.ilike.%Support Team%,name.ilike.%QA Team%');

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

    // Create a variety of teams
    const teams = [
      {
        name: 'Test Team Alpha',
        description: 'Primary support team for testing',
        lead: users.agents[0],
        members: [users.agents[1], users.agents[2], users.admins[0]]
      },
      {
        name: 'Test Team Beta',
        description: 'Secondary support team for testing',
        lead: users.agents[3],
        members: [users.agents[4], users.agents[5], users.admins[1]]
      },
      {
        name: 'QA Team 1',
        description: 'Quality assurance team',
        lead: users.agents[6],
        members: [users.agents[7], users.agents[8]]
      },
      {
        name: 'Support Team X',
        description: 'Experimental support team',
        lead: users.agents[9],
        members: [users.agents[1], users.agents[4]] // Some agents in multiple teams
      }
    ];

    // Create teams and add members
    for (const team of teams) {
      console.log(`Creating team: ${team.name}`);
      
      // Create team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: team.name,
          description: team.description,
          lead_id: team.lead.id
        })
        .select()
        .single();

      if (teamError) {
        console.error(`Error creating team ${team.name}:`, teamError);
        continue;
      }

      // Add members
      for (const member of team.members) {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: newTeam.id,
            user_id: member.id,
            role: member.role
          });

        if (memberError) {
          console.error(`Error adding member ${member.email} to team ${team.name}:`, memberError);
        }
      }

      console.log(`✅ Created team ${team.name} with ${team.members.length} members`);
    }

    console.log('✨ Test teams setup complete');
  } catch (error) {
    console.error('Error in createTestTeams:', error);
    throw error;
  }
}

// Run the setup
createTestTeams()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create test teams:', error);
    process.exit(1);
  }); 