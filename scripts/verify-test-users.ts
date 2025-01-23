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

    // Get all roles from user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      console.error('Failed to list user roles:', rolesError.message);
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

    // Map roles and profiles to users
    testUsers.forEach(user => {
      const userRole = userRoles?.find(r => r.user_id === user.id);
      const profile = profiles?.find(p => p.id === user.id);

      console.log(`
Email: ${user.email}
ID: ${user.id}
User Role (user_roles): ${userRole?.role || 'No role assigned'}
Profile Role (profiles): ${profile?.role || 'No profile found'}
Created: ${new Date(user.created_at).toLocaleString()}
Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
Role Match: ${userRole?.role === profile?.role ? '✅' : '❌'}
      `);
    });

    // Check for any mismatches
    const mismatches = testUsers.filter(user => {
      const userRole = userRoles?.find(r => r.user_id === user.id);
      const profile = profiles?.find(p => p.id === user.id);
      return userRole?.role !== profile?.role;
    });

    if (mismatches.length > 0) {
      console.log('\n⚠️  Role Mismatches Found:');
      console.log('=======================');
      mismatches.forEach(user => {
        const userRole = userRoles?.find(r => r.user_id === user.id);
        const profile = profiles?.find(p => p.id === user.id);
        console.log(`${user.email}: user_roles=${userRole?.role}, profiles=${profile?.role}`);
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