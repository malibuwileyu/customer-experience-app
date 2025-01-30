/**
 * @fileoverview Knowledge Base Service
 * @description
 * Service for managing knowledge base articles, including CRUD operations
 * and search functionality.
 */

import { SupabaseClient, Session } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

export interface KnowledgeBaseArticle {
  id?: string
  title: string
  content: string
  category_id: string
  author_id: string
  created_at?: string
  updated_at?: string
  view_count?: number
  metadata?: Record<string, any>
}

export interface ArticleFilters {
  category_id?: string
  author_id?: string
  search_query?: string
}

export class KnowledgeBaseService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private session: Session | null
  ) {
    if (!session) {
      throw new Error('Authentication required')
    }
  }

  /**
   * Creates a new knowledge base article
   * @param article The article data to create
   * @returns The created article
   */
  async createArticle(article: Omit<KnowledgeBaseArticle, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeBaseArticle> {
    if (!this.session) {
      throw new Error('Authentication required')
    }

    // Ensure the author_id matches the current user's ID
    if (article.author_id !== this.session.user.id) {
      throw new Error('Cannot create article for another user')
    }

    const { data, error } = await this.supabase
      .from('kb_articles')
      .insert({
        ...article,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Create article error:', error)
      if (error.code === '42501') {
        throw new Error('You do not have permission to create articles. Please check your access rights.')
      }
      throw new Error('Failed to create article: ' + error.message)
    }

    return data
  }

  /**
   * Retrieves a knowledge base article by ID
   * @param id The article ID
   * @returns The article if found
   */
  async getArticle(id: string): Promise<KnowledgeBaseArticle> {
    if (!this.session) {
      throw new Error('Authentication required')
    }

    const { data, error } = await this.supabase
      .from('kb_articles')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      console.error('Get article error:', error)
      if (error.code === '42501') {
        throw new Error('You do not have permission to view this article')
      }
      throw new Error('Article not found')
    }

    return data
  }

  /**
   * Updates an existing knowledge base article
   * @param id The article ID
   * @param updates The article data to update
   * @returns The updated article
   */
  async updateArticle(
    id: string,
    updates: Partial<Omit<KnowledgeBaseArticle, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<KnowledgeBaseArticle> {
    if (!this.session) {
      throw new Error('Authentication required')
    }

    // First check if the user owns the article
    const { data: existingArticle, error: fetchError } = await this.supabase
      .from('kb_articles')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingArticle) {
      throw new Error('Article not found')
    }

    if (existingArticle.author_id !== this.session.user.id) {
      throw new Error('You can only update your own articles')
    }

    const { data, error } = await this.supabase
      .from('kb_articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update article error:', error)
      if (error.code === '42501') {
        throw new Error('You do not have permission to update this article')
      }
      throw new Error('Failed to update article: ' + error.message)
    }

    return data
  }

  /**
   * Deletes a knowledge base article
   * @param id The article ID
   */
  async deleteArticle(id: string): Promise<void> {
    if (!this.session) {
      throw new Error('Authentication required')
    }

    // First check if the user owns the article
    const { data: existingArticle, error: fetchError } = await this.supabase
      .from('kb_articles')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingArticle) {
      throw new Error('Article not found')
    }

    if (existingArticle.author_id !== this.session.user.id) {
      throw new Error('You can only delete your own articles')
    }

    const { error } = await this.supabase
      .from('kb_articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete article error:', error)
      if (error.code === '42501') {
        throw new Error('You do not have permission to delete this article')
      }
      throw new Error('Failed to delete article: ' + error.message)
    }
  }

  /**
   * Lists knowledge base articles with optional filters
   * @param filters Optional filters for the article list
   * @returns Array of articles matching the filters
   */
  async listArticles(filters?: ArticleFilters): Promise<KnowledgeBaseArticle[]> {
    if (!this.session) {
      throw new Error('Authentication required')
    }

    let query = this.supabase
      .from('kb_articles')
      .select()

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters?.author_id) {
      query = query.eq('author_id', filters.author_id)
    }

    if (filters?.search_query) {
      query = query.textSearch('title', filters.search_query)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('List articles error:', error)
      if (error.code === '42501') {
        throw new Error('You do not have permission to list articles')
      }
      throw new Error('Failed to list articles: ' + error.message)
    }

    return data
  }

  /**
   * Increments the view count for an article
   * @param id The article ID
   * @returns The updated article with new view count
   */
  async incrementViewCount(id: string): Promise<KnowledgeBaseArticle> {
    if (!this.session) {
      throw new Error('Authentication required')
    }

    try {
      const { data, error } = await this.supabase
        .rpc('increment_article_views', { article_id: id })
        .returns<KnowledgeBaseArticle>()
        .single()

      if (error) {
        console.error('View count increment error:', error)
        throw error
      }

      if (!data) {
        throw new Error('Failed to increment view count: Article not found')
      }

      return data
    } catch (error) {
      console.error('View count increment error:', error)
      throw error
    }
  }
} 