/**
 * @fileoverview Template store type definitions
 * @module types/store/template
 * @description
 * Type definitions for the template store using Zustand.
 * Includes state and actions for managing message templates.
 */

/**
 * Template category type
 */
export interface TemplateCategory {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * Message template type
 */
export interface Template {
  id: string
  title: string
  content: string
  description?: string
  categoryId: string
  variables: string[]
  tone?: string
  tags: string[]
  usageCount: number
  createdAt: string
  updatedAt: string
  isArchived: boolean
}

/**
 * Template creation DTO
 */
export type CreateTemplateDTO = Omit<Template, 'id' | 'usageCount' | 'createdAt' | 'updatedAt' | 'isArchived'>

/**
 * Template update DTO
 */
export type UpdateTemplateDTO = Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>

/**
 * Template store state
 */
export interface TemplateState {
  templates: Template[]
  categories: TemplateCategory[]
  selectedTemplate: Template | null
  selectedCategory: TemplateCategory | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  error: Error | null
}

/**
 * Complete template store type
 */
export interface TemplateStore extends TemplateState {
  // Template operations
  fetchTemplates: (categoryId?: string) => Promise<void>
  fetchTemplateById: (id: string) => Promise<void>
  createTemplate: (data: CreateTemplateDTO) => Promise<void>
  updateTemplate: (id: string, data: UpdateTemplateDTO) => Promise<void>
  archiveTemplate: (id: string) => Promise<void>
  incrementUsage: (id: string) => Promise<void>
  
  // Category operations
  fetchCategories: () => Promise<void>
  createCategory: (name: string, description?: string) => Promise<void>
  updateCategory: (id: string, name: string, description?: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // Selection
  selectTemplate: (template: Template | null) => void
  selectCategory: (category: TemplateCategory | null) => void
  
  // Error handling
  setError: (error: Error | null) => void
  reset: () => void
} 
