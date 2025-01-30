import { createClient } from '@supabase/supabase-js'
import type { KnowledgeBaseCategory } from '../src/services/knowledge-base-category.service'
import type { KnowledgeBaseArticle } from '../src/services/knowledge-base.service'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables')
}

// Create a Supabase client with the service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// We'll use a real admin user's ID for the articles
async function getOrCreateAdminUser() {
  // First, try to get an existing admin user
  const { data: adminUsers, error: queryError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (queryError) {
    throw new Error(`Failed to query admin users: ${queryError.message}`)
  }

  // If we have admin users, use the first one
  if (adminUsers && adminUsers.length > 0) {
    console.log(`Found ${adminUsers.length} admin user(s), using the first one`)
    return adminUsers[0].id
  }

  console.log('No admin users found, creating one...')

  // If no admin exists, create one
  const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
    email: 'admin@example.com',
    password: 'admin123',
    email_confirm: true
  })

  if (signUpError || !user) {
    throw new Error(`Failed to create admin user: ${signUpError?.message || 'Unknown error'}`)
  }

  // Update the user's profile with admin role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to set admin role: ${updateError.message}`)
  }

  console.log('Created new admin user')
  return user.id
}

const categories: Omit<KnowledgeBaseCategory, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Getting Started',
    description: 'Basic information about using the platform',
    parent_id: null,
    display_order: 1
  },
  {
    name: 'Account Management',
    description: 'Managing your account settings and preferences',
    parent_id: null,
    display_order: 2
  },
  {
    name: 'Billing & Subscriptions',
    description: 'Information about billing, payments, and subscription plans',
    parent_id: null,
    display_order: 3
  },
  {
    name: 'Security',
    description: 'Security features and best practices',
    parent_id: null,
    display_order: 4
  }
]

async function createArticles(adminUserId: string) {
  const articleData: Record<string, Omit<KnowledgeBaseArticle, 'id' | 'created_at' | 'updated_at'>[]> = {
    'Getting Started': [
      {
        title: 'How to Create Your First Project',
        content: 'Learn how to create and set up your first project in our platform. Follow these simple steps:\n\n1. Click the "New Project" button\n2. Enter your project name and description\n3. Choose your project settings\n4. Invite team members\n5. Start collaborating!',
        category_id: '', // Will be filled with actual category ID
        author_id: adminUserId
      },
      {
        title: 'Understanding the Dashboard',
        content: 'Get familiar with our intuitive dashboard interface. Learn about key metrics, navigation, and customization options to make the most of your experience.',
        category_id: '',
        author_id: adminUserId
      }
    ],
    'Account Management': [
      {
        title: 'How to Update Your Profile',
        content: 'Keep your profile information up to date by following these steps:\n\n1. Go to Settings\n2. Click on Profile\n3. Update your information\n4. Save changes',
        category_id: '',
        author_id: adminUserId
      },
      {
        title: 'Managing Team Members',
        content: 'Learn how to add, remove, and manage team members in your organization. Understand different roles and permissions available.',
        category_id: '',
        author_id: adminUserId
      }
    ],
    'Billing & Subscriptions': [
      {
        title: 'Understanding Your Bill',
        content: 'Learn how to read and understand your monthly bill. Find information about charges, credits, and usage-based pricing.',
        category_id: '',
        author_id: adminUserId
      },
      {
        title: 'Changing Subscription Plans',
        content: 'Follow this guide to upgrade or downgrade your subscription plan. Learn about different features available in each plan.',
        category_id: '',
        author_id: adminUserId
      }
    ],
    'Security': [
      {
        title: 'Two-Factor Authentication Setup',
        content: 'Enhance your account security by enabling two-factor authentication (2FA). Follow our step-by-step guide to set up 2FA using your preferred method.',
        category_id: '',
        author_id: adminUserId
      },
      {
        title: 'Best Practices for Password Security',
        content: 'Learn about password best practices including:\n\n- Creating strong passwords\n- Using password managers\n- Regular password updates\n- Avoiding common security mistakes',
        category_id: '',
        author_id: adminUserId
      }
    ]
  }

  // Create a FAQ category for common articles
  const { data: faqCategory, error: faqError } = await supabase
    .from('kb_categories')
    .insert({
      name: 'Frequently Asked Questions',
      description: 'Common questions and answers',
      parent_id: null,
      display_order: 5
    })
    .select()
    .single()

  if (faqError) {
    throw new Error(`Failed to create FAQ category: ${faqError.message}`)
  }

  // Common/FAQ articles with the FAQ category ID
  const commonArticles: Omit<KnowledgeBaseArticle, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      title: 'What is the SLA for support tickets?',
      content: 'Our Service Level Agreement (SLA) for support tickets varies by priority:\n\n- Critical: 1 hour response time\n- High: 4 hours response time\n- Medium: 8 hours response time\n- Low: 24 hours response time',
      category_id: faqCategory.id,
      author_id: adminUserId
    },
    {
      title: 'How do I contact support?',
      content: 'There are several ways to contact our support team:\n\n1. Submit a ticket through the help desk\n2. Email support@example.com\n3. Use the in-app chat during business hours\n4. Call our support line for urgent issues',
      category_id: faqCategory.id,
      author_id: adminUserId
    }
  ]

  return { articles: articleData, commonArticles }
}

async function populateKnowledgeBase() {
  try {
    console.log('Starting knowledge base population...')

    // Get or create an admin user's ID for the articles
    const adminUserId = await getOrCreateAdminUser()
    console.log('Using admin user ID:', adminUserId)

    // Get article data with the admin user ID
    const { articles, commonArticles } = await createArticles(adminUserId)

    // Insert categories
    for (const category of categories) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('kb_categories')
        .insert(category)
        .select()
        .single()

      if (categoryError) {
        throw new Error(`Failed to insert category ${category.name}: ${categoryError.message}`)
      }

      console.log(`Created category: ${category.name}`)

      // Insert articles for this category
      const categoryArticles = articles[category.name]
      if (categoryArticles) {
        for (const article of categoryArticles) {
          article.category_id = categoryData.id
          const { error: articleError } = await supabase
            .from('kb_articles')
            .insert(article)

          if (articleError) {
            throw new Error(`Failed to insert article ${article.title}: ${articleError.message}`)
          }

          console.log(`Created article: ${article.title}`)
        }
      }
    }

    // Insert common/FAQ articles
    for (const article of commonArticles) {
      const { error: articleError } = await supabase
        .from('kb_articles')
        .insert(article)

      if (articleError) {
        throw new Error(`Failed to insert common article ${article.title}: ${articleError.message}`)
      }

      console.log(`Created article: ${article.title}`)
    }

    console.log('Knowledge base population completed successfully!')
  } catch (error) {
    console.error('Failed to populate knowledge base:', error)
    throw error
  }
}

// Run the script
populateKnowledgeBase() 