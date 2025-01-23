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

const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  },
  agent: {
    email: 'agent@test.com',
    password: 'agent123',
    role: 'agent'
  },
  customer: {
    email: 'customer@test.com',
    password: 'customer123',
    role: 'customer'
  }
};

async function createTestUsers() {
  for (const [key, account] of Object.entries(TEST_ACCOUNTS)) {
    try {
      // First, check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === account.email);

      let userId: string;

      if (existingUser) {
        console.log(`User ${account.email} already exists, using existing user`);
        userId = existingUser.id;
      } else {
        // Create new user with role in metadata
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            role: account.role
          }
        });

        if (authError) {
          console.error(`Failed to create ${key} user:`, authError.message);
          continue;
        }

        if (!authData.user) {
          console.error(`No user data returned for ${key}`);
          continue;
        }

        userId = authData.user.id;
        console.log(`Created user ${account.email}`);
      }

      // Delete any existing role for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: account.role,
        });

      if (roleError) {
        console.error(`Failed to assign role for ${key}:`, roleError.message);
        continue;
      }

      console.log(`✅ ${existingUser ? 'Updated' : 'Created'} ${key} user with role ${account.role}`);
    } catch (error) {
      console.error(`Error processing ${key} user:`, error);
    }
  }
}

createTestUsers()
  .then(() => {
    console.log('✨ Test users setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to setup test users:', error);
    process.exit(1);
  }); 