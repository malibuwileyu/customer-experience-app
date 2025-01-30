/**
 * @fileoverview Template service for managing message templates
 * @module services/template
 */

import { supabase } from '../lib/supabase'
import type { 
  Template, 
  TemplateCategory,
  CreateTemplateDTO,
  UpdateTemplateDTO 
} from '../types/store/template.store'

/**
 * Template service class
 */
class TemplateService {
  /**
   * Fetch all templates, optionally filtered by category
   */
  async getTemplates(categoryId?: string): Promise<Template[]> {
    let query = supabase
      .from('templates')
      .select('*')
      .eq('isArchived', false)
      .order('updatedAt', { ascending: false })

    if (categoryId) {
      query = query.eq('categoryId', categoryId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Template[]
  }

  /**
   * Fetch a single template by ID
   */
  async getTemplate(id: string): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Template
  }

  /**
   * Create a new template
   */
  async createTemplate(template: CreateTemplateDTO): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .insert([{
        ...template,
        usageCount: 0,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data as Template
  }

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, updates: UpdateTemplateDTO): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Template
  }

  /**
   * Archive a template
   */
  async archiveTemplate(id: string): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update({
        isArchived: true,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Template
  }

  /**
   * Increment template usage count
   */
  async incrementUsage(id: string): Promise<Template> {
    const { data, error } = await supabase.rpc('increment_template_usage', {
      template_id: id
    })

    if (error) throw error
    return data as Template
  }

  /**
   * Fetch all template categories
   */
  async getCategories(): Promise<TemplateCategory[]> {
    const { data, error } = await supabase
      .from('template_categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data as TemplateCategory[]
  }

  /**
   * Create a new template category
   */
  async createCategory(name: string, description?: string): Promise<TemplateCategory> {
    const { data, error } = await supabase
      .from('template_categories')
      .insert([{
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data as TemplateCategory
  }

  /**
   * Update a template category
   */
  async updateCategory(id: string, name: string, description?: string): Promise<TemplateCategory> {
    const { data, error } = await supabase
      .from('template_categories')
      .update({
        name,
        description,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TemplateCategory
  }

  /**
   * Delete a template category
   */
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('template_categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const templateService = new TemplateService() 
