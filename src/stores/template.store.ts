/**
 * @fileoverview Template store for managing template state
 * @module stores/template
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  TemplateStore, 
  TemplateState,
  Template,
  TemplateCategory,
  CreateTemplateDTO,
  UpdateTemplateDTO
} from '../types/store/template.store'
import { templateService } from '../services/template.service'

/**
 * Initial template state
 */
const initialState: TemplateState = {
  templates: [],
  categories: [],
  selectedTemplate: null,
  selectedCategory: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
}

/**
 * Template store hook using Zustand
 * 
 * Features:
 * - Template CRUD operations
 * - Category management
 * - Usage tracking
 * - Error handling
 * 
 * @example
 * ```tsx
 * function TemplateList() {
 *   const { templates, isLoading, error } = useTemplateStore()
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   
 *   return (
 *     <ul>
 *       {templates.map(template => (
 *         <li key={template.id}>{template.title}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export const useTemplateStore = create<TemplateStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // Template operations
      fetchTemplates: async (categoryId?: string) => {
        try {
          set((state) => ({ ...state, isLoading: true, error: null }))
          const templates = await templateService.getTemplates(categoryId)
          set((state) => ({ ...state, templates, isLoading: false }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isLoading: false }))
        }
      },

      fetchTemplateById: async (id: string) => {
        try {
          set((state) => ({ ...state, isLoading: true, error: null }))
          const template = await templateService.getTemplate(id)
          set((state) => ({ ...state, selectedTemplate: template, isLoading: false }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isLoading: false }))
        }
      },

      createTemplate: async (data: CreateTemplateDTO) => {
        try {
          set((state) => ({ ...state, isCreating: true, error: null }))
          const template = await templateService.createTemplate(data)
          set((state) => ({ 
            ...state,
            templates: [template, ...state.templates],
            isCreating: false 
          }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isCreating: false }))
        }
      },

      updateTemplate: async (id: string, data: UpdateTemplateDTO) => {
        try {
          set((state) => ({ ...state, isUpdating: true, error: null }))
          const template = await templateService.updateTemplate(id, data)
          set((state) => ({
            ...state,
            templates: state.templates.map((t) => 
              t.id === id ? template : t
            ),
            selectedTemplate: state.selectedTemplate?.id === id 
              ? template 
              : state.selectedTemplate,
            isUpdating: false
          }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isUpdating: false }))
        }
      },

      archiveTemplate: async (id: string) => {
        try {
          set((state) => ({ ...state, isUpdating: true, error: null }))
          const template = await templateService.archiveTemplate(id)
          set((state) => ({
            ...state,
            templates: state.templates.filter((t) => t.id !== id),
            selectedTemplate: state.selectedTemplate?.id === id 
              ? null 
              : state.selectedTemplate,
            isUpdating: false
          }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isUpdating: false }))
        }
      },

      incrementUsage: async (id: string) => {
        try {
          const template = await templateService.incrementUsage(id)
          set((state) => ({
            ...state,
            templates: state.templates.map((t) => 
              t.id === id ? template : t
            ),
            selectedTemplate: state.selectedTemplate?.id === id 
              ? template 
              : state.selectedTemplate
          }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error }))
        }
      },

      // Category operations
      fetchCategories: async () => {
        try {
          set((state) => ({ ...state, isLoading: true, error: null }))
          const categories = await templateService.getCategories()
          set((state) => ({ ...state, categories, isLoading: false }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isLoading: false }))
        }
      },

      createCategory: async (name: string, description?: string) => {
        try {
          set((state) => ({ ...state, isCreating: true, error: null }))
          const category = await templateService.createCategory(name, description)
          set((state) => ({ 
            ...state,
            categories: [...state.categories, category],
            isCreating: false 
          }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isCreating: false }))
        }
      },

      updateCategory: async (id: string, name: string, description?: string) => {
        try {
          set((state) => ({ ...state, isUpdating: true, error: null }))
          const category = await templateService.updateCategory(id, name, description)
          set((state) => ({
            ...state,
            categories: state.categories.map((c) => 
              c.id === id ? category : c
            ),
            selectedCategory: state.selectedCategory?.id === id 
              ? category 
              : state.selectedCategory,
            isUpdating: false
          }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isUpdating: false }))
        }
      },

      deleteCategory: async (id: string) => {
        try {
          set((state) => ({ ...state, isUpdating: true, error: null }))
          await templateService.deleteCategory(id)
          set((state) => ({
            ...state,
            categories: state.categories.filter((c) => c.id !== id),
            selectedCategory: state.selectedCategory?.id === id 
              ? null 
              : state.selectedCategory,
            isUpdating: false
          }))
        } catch (error) {
          set((state) => ({ ...state, error: error as Error, isUpdating: false }))
        }
      },

      // Selection
      selectTemplate: (template: Template | null) => 
        set((state) => ({ ...state, selectedTemplate: template })),

      selectCategory: (category: TemplateCategory | null) => 
        set((state) => ({ ...state, selectedCategory: category })),

      // Error handling
      setError: (error: Error | null) => 
        set((state) => ({ ...state, error })),

      // Reset state
      reset: () => set(initialState)
    }),
    { name: 'template-store' }
  )
) 
