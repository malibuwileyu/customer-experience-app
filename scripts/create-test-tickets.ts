import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import type { Team } from '../src/types/models/team.types';
import type { TicketPriority, TicketStatus } from '../src/types/models/ticket.types';

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

interface TestUser {
  id: string;
  email: string;
  role: string;
}

interface TestData {
  users: {
    admins: TestUser[];
    agents: TestUser[];
    customers: TestUser[];
  };
  teams: Team[];
}

async function getTestData(): Promise<TestData> {
  // Get all test users
  const { data: profiles, error: userError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .or('email.ilike.%test.com,email.ilike.%example.com');

  if (userError) {
    console.error('Error fetching test users:', userError);
    throw userError;
  }

  // Get all test teams
  const { data: teams, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .or('name.ilike.%Test Team%,name.ilike.%Support Team%,name.ilike.%QA Team%');

  if (teamError) {
    console.error('Error fetching test teams:', teamError);
    throw teamError;
  }

  return {
    users: {
      admins: profiles.filter(p => p.role === 'admin'),
      agents: profiles.filter(p => p.role === 'agent'),
      customers: profiles.filter(p => p.role === 'customer')
    },
    teams: teams || []
  };
}

async function createTestTickets() {
  console.log('Setting up test tickets...');

  try {
    const data = await getTestData();

    if (data.teams.length === 0) {
      throw new Error('No test teams found. Please run create-test-teams script first.');
    }

    // Clean up existing test tickets
    const { data: existingTickets } = await supabase
      .from('tickets')
      .select('id, title')
      .or('title.ilike.%Test Ticket%,title.ilike.%Support Request%,title.ilike.%Bug Report%');

    if (existingTickets?.length) {
      console.log('Cleaning up existing tickets:', existingTickets.map(t => t.title));
      await supabase
        .from('tickets')
        .delete()
        .in('id', existingTickets.map(t => t.id));
    }

    // Create tickets with various configurations
    const ticketConfigs = [
      // High priority tickets
      ...data.teams.map((team, i) => ({
        title: `Test Ticket ${i + 1} - High Priority`,
        description: 'This is a high priority test ticket',
        status: 'open' as TicketStatus,
        priority: 'high' as TicketPriority,
        team_id: team.id,
        created_by: data.users.customers[i % data.users.customers.length].id,
        assigned_to: data.users.agents[i % data.users.agents.length].id
      })),

      // Medium priority tickets in different states
      ...['open', 'in_progress', 'resolved', 'closed'].map((status, i) => ({
        title: `Support Request ${i + 1} - ${status}`,
        description: `This is a ${status} support request`,
        status: status as TicketStatus,
        priority: 'medium' as TicketPriority,
        team_id: data.teams[i % data.teams.length].id,
        created_by: data.users.customers[i % data.users.customers.length].id,
        assigned_to: data.users.agents[i % data.users.agents.length].id
      })),

      // Low priority tickets
      ...data.teams.map((team, i) => ({
        title: `Bug Report ${i + 1} - Low Priority`,
        description: 'This is a low priority bug report',
        status: 'open' as TicketStatus,
        priority: 'low' as TicketPriority,
        team_id: team.id,
        created_by: data.users.customers[i % data.users.customers.length].id,
        assigned_to: null // Some tickets unassigned
      })),

      // Urgent tickets
      ...data.teams.slice(0, 2).map((team, i) => ({
        title: `Test Ticket ${i + 1} - Urgent`,
        description: 'This is an urgent test ticket',
        status: 'open' as TicketStatus,
        priority: 'urgent' as TicketPriority,
        team_id: team.id,
        created_by: data.users.customers[i % data.users.customers.length].id,
        assigned_to: data.users.agents[i % data.users.agents.length].id,
        sla_due_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString() // 4 hours from now
      }))
    ];

    // Create tickets
    for (const ticket of ticketConfigs) {
      const { error } = await supabase
        .from('tickets')
        .insert(ticket);

      if (error) {
        console.error(`Error creating ticket ${ticket.title}:`, error);
      } else {
        console.log(`✅ Created ticket: ${ticket.title}`);
      }
    }

    console.log('✨ Test tickets setup complete');
  } catch (error) {
    console.error('Error in createTestTickets:', error);
    throw error;
  }
}

// Run the setup
createTestTickets()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create test tickets:', error);
    process.exit(1);
  }); 