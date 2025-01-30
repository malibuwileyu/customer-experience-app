import { supabase } from '../src/lib/supabase/client'

async function cleanupKnowledgeBase() {
  try {
    console.log('Cleaning up knowledge base tables...')

    // Delete all kb_article_versions
    await supabase.from('kb_article_versions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Delete all kb_articles except the specified one
    await supabase
      .from('kb_articles')
      .delete()
      .neq('id', 'aead35aa-24a5-4640-90a2-bdcc4cae7430')
    
    // Delete all kb_categories except the specified one
    await supabase
      .from('kb_categories')
      .delete()
      .neq('id', '258ab2fa-c668-484d-a2e1-816a861f1336')

    console.log('Knowledge base cleanup completed successfully!')
  } catch (error) {
    console.error('Failed to clean up knowledge base:', error)
    throw error
  }
}

async function setupKnowledgeBase() {
  try {
    // First clean up existing data
    await cleanupKnowledgeBase()

    // Then proceed with setup...
    console.log('Setting up knowledge base...')
    
    // Rest of your existing setup code...
  } catch (error) {
    console.error('Failed to set up knowledge base:', error)
    throw error
  }
}

export { setupKnowledgeBase, cleanupKnowledgeBase } 