/**
 * @fileoverview Knowledge Base Category Service
 * @description
 * Service for managing knowledge base categories, including CRUD operations
 * and hierarchical category structure.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { supabaseService } from '../lib/supabase'

export interface KnowledgeBaseCategory {
  id: string
  name: string
  description: string
  parent_id: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export class KnowledgeBaseCategoryService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new knowledge base category
   * @param data The category data to create
   * @returns The created category
   */
  async createCategory(data: Omit<KnowledgeBaseCategory, 'id' | 'created_at' | 'updated_at'>) {
    const { data: category, error } = await this.supabase
      .from('kb_categories')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return category
  }

  /**
   * Retrieves a knowledge base category by ID
   * @param id The category ID
   * @returns The category if found
   */
  async getCategory(id: string) {
    const { data: category, error } = await this.supabase
      .from('kb_categories')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return category
  }

  /**
   * Updates an existing knowledge base category
   * @param id The category ID
   * @param data The category data to update
   * @returns The updated category
   */
  async updateCategory(id: string, data: Partial<Omit<KnowledgeBaseCategory, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: category, error } = await this.supabase
      .from('kb_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return category
  }

  /**
   * Deletes a knowledge base category
   * @param id The category ID
   */
  async deleteCategory(id: string) {
    const { error } = await this.supabase
      .from('kb_categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Updates a category's display order
   * @param id The category ID
   * @param newOrder The new display order
   */
  async updateCategoryOrder(id: string, newOrder: number) {
    const { error } = await this.supabase
      .from('kb_categories')
      .update({ display_order: newOrder })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Lists all categories ordered by display_order
   * @returns Array of categories
   */
  async listCategories() {
    const { data: categories, error } = await this.supabase
      .from('kb_categories')
      .select()
      .order('display_order', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return categories
  }

  /**
   * Gets all child categories for a given parent category
   * @param parentId The parent category ID
   * @returns Array of child categories
   */
  async getChildCategories(parentId: string): Promise<KnowledgeBaseCategory[]> {
    const { data, error } = await supabaseService
      .from('kb_categories')
      .select()
      .eq('parent_id', parentId)
      .order('name', { ascending: true })

    if (error) {
      throw new Error('Failed to get child categories')
    }

    return data
  }

  /**
   * Gets all root categories (categories without a parent)
   * @returns Array of root categories
   */
  async getRootCategories(): Promise<KnowledgeBaseCategory[]> {
    const { data, error } = await supabaseService
      .from('kb_categories')
      .select()
      .is('parent_id', null)
      .order('name', { ascending: true })

    if (error) {
      throw new Error('Failed to get root categories')
    }

    return data
  }
} 