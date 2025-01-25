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

async function verifyTestUsers() {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Failed to list users:', usersError.message);
      return;
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Failed to list profiles:', profilesError.message);
      return;
    }

    console.log('\nTest Users:');
    console.log('===========');

    // Filter for test users (emails containing 'test' or 'testuser')
    const testUsers = users.users.filter(user => 
      user.email?.toLowerCase().includes('test') || 
      user.email?.toLowerCase().includes('testuser')
    );

    // Map profiles to users
    testUsers.forEach(user => {
      const profile = profiles?.find(p => p.id === user.id);

      console.log(`
Email: ${user.email}
ID: ${user.id}
Profile Role: ${profile?.role || 'No profile found'}
Created: ${new Date(user.created_at).toLocaleString()}
Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
Profile Status: ${profile ? '✅' : '❌'}
      `);
    });

    // Check for missing profiles
    const missingProfiles = testUsers.filter(user => {
      const profile = profiles?.find(p => p.id === user.id);
      return !profile;
    });

    if (missingProfiles.length > 0) {
      console.log('\n⚠️  Missing Profiles Found:');
      console.log('=======================');
      missingProfiles.forEach(user => {
        console.log(`${user.email}: No profile found`);
      });
    }
  } catch (error) {
    console.error('Failed to verify users:', error);
  }
}

verifyTestUsers()
  .then(() => {
    console.log('✨ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to verify users:', error);
    process.exit(1);
  }); 