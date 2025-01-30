/**
 * @fileoverview Script to clean up test users from auth.users table
 * @description
 * This script finds and deletes test users that match the pattern 'testuser_*@gmail.com'
 * while preserving any test users that are actively being used in tests.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanupTestUsers() {
  try {
    // First, get all test users
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      throw fetchError
    }

    // Filter for test users matching the pattern
    const testUsers = users.users.filter(user => 
      user.email?.match(/^testuser_\d+@gmail\.com$/)
    )

    console.log(`Found ${testUsers.length} test users to clean up:`)
    testUsers.forEach(user => {
      console.log(`- ${user.email} (${user.id})`)
    })

    // Confirm with user
    console.log('\nAre you sure you want to delete these users? (y/n)')
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase()
      
      if (answer === 'y') {
        console.log('\nDeleting users...')
        
        // Delete users one by one and log results
        for (const user of testUsers) {
          try {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
            if (deleteError) {
              console.error(`Failed to delete ${user.email}: ${deleteError.message}`)
            } else {
              console.log(`Successfully deleted ${user.email}`)
            }
          } catch (err) {
            console.error(`Error deleting ${user.email}:`, err)
          }
        }
        
        console.log('\nCleanup complete!')
      } else {
        console.log('Operation cancelled.')
      }
      
      process.exit(0)
    })

  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  }
}

// Run the cleanup
cleanupTestUsers() 