/**
 * Knowledge base article interface
 */
export interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  categoryId: string
  authorId: string
  createdAt: string
  updatedAt: string
  version?: number
}

/**
 * Knowledge base category interface
 */
export interface KnowledgeBaseCategory {
  id: string
  name: string
  description: string | null
  parentId: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Knowledge base store state interface
 */
export interface KnowledgeBaseState {
  articles: KnowledgeBaseArticle[]
  categories: KnowledgeBaseCategory[]
  isLoading: boolean
  error: Error | null
}

/**
 * Knowledge base store actions interface
 */
export interface KnowledgeBaseActions {
  // Article actions
  setArticles: (articles: KnowledgeBaseArticle[]) => void
  addArticle: (article: KnowledgeBaseArticle) => void
  updateArticle: (article: KnowledgeBaseArticle) => void
  removeArticle: (id: string) => void

  // Category actions
  setCategories: (categories: KnowledgeBaseCategory[]) => void
  addCategory: (category: KnowledgeBaseCategory) => void
  updateCategory: (category: KnowledgeBaseCategory) => void
  removeCategory: (id: string) => void

  // State management
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  reset: () => void
} 