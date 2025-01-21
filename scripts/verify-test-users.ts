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
  // Get all users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Failed to list users:', usersError.message);
    return;
  }

  // Get all roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*');

  if (rolesError) {
    console.error('Failed to list roles:', rolesError.message);
    return;
  }

  console.log('\nTest Users:');
  console.log('===========');

  // Map roles to users
  users.users.forEach(user => {
    const userRole = roles?.find(r => r.user_id === user.id);
    console.log(`
Email: ${user.email}
ID: ${user.id}
Role: ${userRole?.role || 'No role assigned'}
Created: ${new Date(user.created_at).toLocaleString()}
Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
    `);
  });
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