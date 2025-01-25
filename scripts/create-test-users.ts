import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY are set.');
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// Verify admin access
const { data: adminCheck, error: adminError } = await supabase.auth.admin.listUsers();
if (adminError) {
  throw new Error(`Failed to verify admin access: ${adminError.message}`);
}
console.log('Admin access verified, proceeding with user creation...\n');

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate test accounts with consistent naming
const TEST_ACCOUNTS = {
  // Admin accounts (admin1 through admin5)
  ...Array.from({ length: 5 }, (_, i) => ({
    [`admin${i + 1}`]: {
      email: `admin${i + 1}@test.com`,
      password: 'Admin123!@#',
      role: 'admin',
      full_name: `Admin ${i + 1}`
    }
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

  // Agent accounts (agent1 through agent10)
  ...Array.from({ length: 10 }, (_, i) => ({
    [`agent${i + 1}`]: {
      email: `agent${i + 1}@test.com`,
      password: 'Agent123!@#',
      role: 'agent',
      full_name: `Agent ${i + 1}`
    }
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

  // Customer accounts (customer1 through customer10)
  ...Array.from({ length: 10 }, (_, i) => ({
    [`customer${i + 1}`]: {
      email: `customer${i + 1}@test.com`,
      password: 'Customer123!@#',
      role: 'customer',
      full_name: `Customer ${i + 1}`
    }
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
};

async function createTestUsers() {
  for (const [key, account] of Object.entries(TEST_ACCOUNTS)) {
    try {
      console.log(`\nProcessing ${key}...`);
      
      // First, check if user exists in Auth
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        continue;
      }
      
      const existingUser = existingUsers.users.find(u => u.email === account.email);

      // Then check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', account.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        continue;
      }

      // If user exists in Auth but not in profiles, we need to create their profile
      if (existingUser && !existingProfile) {
        console.log(`User ${account.email} exists in Auth but missing profile, creating profile...`);
        
        // Create profile for existing user
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: existingUser.id,
            email: account.email,
            full_name: account.full_name,
            role: account.role
          });

        if (insertError) {
          console.error(`Failed to create profile for ${key}:`, insertError);
          continue;
        }

        console.log(`✅ Created profile for ${key} with role ${account.role}`);
        continue;
      }

      // Skip if user exists in both Auth and profiles
      if (existingUser && existingProfile) {
        console.log(`User ${account.email} already exists with profile, skipping...`);
        continue;
      }

      console.log(`Creating new user ${account.email}...`);

      // Create new user with all required fields
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.full_name,
          role: account.role
        }
      });

      if (authError) {
        console.error(`Failed to create ${key} user:`, authError);
        continue;
      }

      if (!authData.user) {
        console.error(`No user data returned for ${key}`);
        continue;
      }

      console.log(`✅ Created ${key} user with role ${account.role}`);
      
      // Add a delay between user creations to avoid rate limiting
      await delay(500);
    } catch (error) {
      console.error(`Error processing ${key} user:`, error);
    }
  }
}

createTestUsers()
  .then(() => {
    console.log('\n✨ Test users setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFailed to setup test users:', error);
    process.exit(1);
  }); 