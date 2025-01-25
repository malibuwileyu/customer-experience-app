import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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
    persistSession: false
  }
});

async function cleanupTestUsers() {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Failed to list users:', usersError.message);
      return;
    }

    // Find test users (emails containing 'test' or 'testuser')
    const testUsers = users.users.filter(user => 
      user.email?.toLowerCase().includes('test') || 
      user.email?.toLowerCase().includes('testuser')
    );

    console.log(`Found ${testUsers.length} test users to clean up`);

    // Clean up each test user
    for (const user of testUsers) {
      try {
        // Delete user profile (includes role information)
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        // Delete any team memberships
        await supabase
          .from('team_members')
          .delete()
          .eq('user_id', user.id);

        // Delete auth user (this should cascade delete other related data)
        await supabase.auth.admin.deleteUser(user.id);

        console.log(`✓ Cleaned up user ${user.email} and related data`);
      } catch (error) {
        console.error(`Failed to clean up user ${user.email}:`, error);
      }
    }

    console.log('✨ Test user cleanup complete');
  } catch (error) {
    console.error('Failed to clean up test users:', error);
  }
}

cleanupTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 