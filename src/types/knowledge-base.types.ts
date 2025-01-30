/**
 * Knowledge base article status
 */
export type ArticleStatus = 'draft' | 'published' | 'archived'

/**
 * Knowledge base article interface
 */
export interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  category_id: string
  author_id: string
  status: ArticleStatus
  created_at: string
  updated_at: string
}

/**
 * Knowledge base category interface
 */
export interface KnowledgeBaseCategory {
  id: string
  name: string
  description: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Knowledge base store state interface
 */
export interface KnowledgeBaseState {
  // Articles
  articles: KnowledgeBaseArticle[]
  selectedArticle: KnowledgeBaseArticle | null
  
  // Categories
  categories: KnowledgeBaseCategory[]
  selectedCategory: KnowledgeBaseCategory | null
  
  // UI State
  isLoading: boolean
  error: Error | null

  // Actions
  setArticles: (articles: KnowledgeBaseArticle[]) => void
  setSelectedArticle: (article: KnowledgeBaseArticle | null) => void
  clearSelectedArticle: () => void
  
  setCategories: (categories: KnowledgeBaseCategory[]) => void
  setSelectedCategory: (category: KnowledgeBaseCategory | null) => void
  clearSelectedCategory: () => void
  
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  clearError: () => void
  
  reset: () => void
} 