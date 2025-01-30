import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY // Using service role key

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface Category {
  name: string
  description: string
  parent_id: string | null
}

interface Article {
  title: string
  content: string
  category_id: string
  author_id: string
}

// Example categories with a hierarchical structure
const categories: Category[] = [
  {
    name: 'Getting Started',
    description: 'Essential information for new users',
    parent_id: null
  },
  {
    name: 'Account Management',
    description: 'Managing your account settings and preferences',
    parent_id: null
  },
  {
    name: 'Troubleshooting',
    description: 'Common issues and their solutions',
    parent_id: null
  },
  {
    name: 'Security',
    description: 'Account security and best practices',
    parent_id: 'account-management'
  },
  {
    name: 'Billing',
    description: 'Billing and subscription management',
    parent_id: 'account-management'
  },
  {
    name: 'Common Issues',
    description: 'Frequently encountered problems',
    parent_id: 'troubleshooting'
  },
  {
    name: 'Advanced Topics',
    description: 'In-depth technical information',
    parent_id: 'troubleshooting'
  }
]

// Example articles mapped to categories
const articles: Omit<Article, 'author_id'>[] = [
  {
    title: 'Welcome to Our Platform',
    content: `
      <h2>Welcome to Our Platform!</h2>
      <p>This guide will help you get started with our platform. Here's what you'll learn:</p>
      <ul>
        <li>How to set up your account</li>
        <li>Basic navigation</li>
        <li>Key features and functionality</li>
      </ul>
      <p>Let's begin your journey!</p>
    `,
    category_id: 'getting-started'
  },
  {
    title: 'Setting Up Two-Factor Authentication',
    content: `
      <h2>Enhance Your Account Security</h2>
      <p>Two-factor authentication (2FA) adds an extra layer of security to your account.</p>
      <h3>Steps to Enable 2FA:</h3>
      <ol>
        <li>Go to Account Settings</li>
        <li>Select Security</li>
        <li>Click Enable 2FA</li>
        <li>Follow the prompts to complete setup</li>
      </ol>
      <p>We recommend using an authenticator app for the best security.</p>
    `,
    category_id: 'security'
  },
  {
    title: 'Managing Your Subscription',
    content: `
      <h2>Subscription Management Guide</h2>
      <p>Learn how to manage your subscription settings and billing preferences.</p>
      <h3>Key Topics:</h3>
      <ul>
        <li>Viewing your current plan</li>
        <li>Upgrading or downgrading</li>
        <li>Payment methods</li>
        <li>Billing history</li>
      </ul>
      <p>Contact support if you need assistance with billing matters.</p>
    `,
    category_id: 'billing'
  },
  {
    title: 'Common Login Issues',
    content: `
      <h2>Resolving Login Problems</h2>
      <p>If you're having trouble logging in, try these common solutions:</p>
      <ul>
        <li>Reset your password</li>
        <li>Clear browser cache</li>
        <li>Check for caps lock</li>
        <li>Verify your email address</li>
      </ul>
      <p>Still having issues? Contact our support team.</p>
    `,
    category_id: 'common-issues'
  }
]

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...')

    // Get a valid user ID using the admin API
    console.log('Fetching a valid user ID...')
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) throw userError
    if (!users || users.length === 0) throw new Error('No users found in the database')

    const authorId = users[0].id

    // Clear existing data
    console.log('Clearing existing data...')
    await supabase.from('kb_articles').delete().neq('id', '')
    await supabase.from('kb_categories').delete().neq('id', '')

    // Insert categories
    console.log('Creating categories...')
    const categoryMap = new Map<string, string>()
    
    // First pass: Create parent categories
    for (const category of categories.filter(c => !c.parent_id)) {
      const { data, error } = await supabase
        .from('kb_categories')
        .insert({
          name: category.name,
          description: category.description,
          parent_id: null
        })
        .select()
        .single()

      if (error) throw error
      categoryMap.set(category.name.toLowerCase().replace(/\s+/g, '-'), data.id)
    }

    // Second pass: Create child categories
    for (const category of categories.filter(c => c.parent_id)) {
      const { data, error } = await supabase
        .from('kb_categories')
        .insert({
          name: category.name,
          description: category.description,
          parent_id: categoryMap.get(category.parent_id || '')
        })
        .select()
        .single()

      if (error) throw error
      categoryMap.set(category.name.toLowerCase().replace(/\s+/g, '-'), data.id)
    }

    // Insert articles
    console.log('Creating articles...')
    for (const article of articles) {
      const categoryId = categoryMap.get(article.category_id)
      if (!categoryId) {
        console.warn(`Category not found for article: ${article.title}`)
        continue
      }

      const { error } = await supabase
        .from('kb_articles')
        .insert({
          ...article,
          category_id: categoryId,
          author_id: authorId
        })

      if (error) throw error
    }

    console.log('Database initialization completed successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

// Run the initialization
initializeDatabase() 