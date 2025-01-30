/**
 * @fileoverview Knowledge Base Hooks
 * @description
 * Custom hooks for managing knowledge base articles and categories
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KnowledgeBaseService, type KnowledgeBaseArticle } from '../../services/knowledge-base.service'
import { KnowledgeBaseCategoryService, type KnowledgeBaseCategory } from '../../services/knowledge-base-category.service'
import { useSupabase } from '../../lib/supabase/client'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Hook for managing knowledge base articles
 */
export function useArticles(categoryId?: string) {
  const { supabase } = useSupabase()
  const { session } = useAuth()
  const service = new KnowledgeBaseService(supabase, session)

  return useQuery({
    queryKey: ['articles', categoryId],
    queryFn: () => service.listArticles({ category_id: categoryId }),
    enabled: !!session
  })
}

/**
 * Hook for managing knowledge base article mutations
 */
export function useArticleMutations() {
  const { supabase } = useSupabase()
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const service = new KnowledgeBaseService(supabase, session)

  const createArticle = useMutation({
    mutationFn: service.createArticle.bind(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  const updateArticle = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return service.updateArticle(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  const deleteArticle = useMutation({
    mutationFn: service.deleteArticle.bind(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  const incrementViewCount = useMutation({
    mutationFn: service.incrementViewCount.bind(service),
    onSuccess: (data: KnowledgeBaseArticle) => {
      queryClient.invalidateQueries({ queryKey: ['article', data.id] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  return {
    createArticle,
    updateArticle,
    deleteArticle,
    incrementViewCount
  }
}

/**
 * Hook for managing knowledge base article
 */
export function useArticle(id: string) {
  const { supabase } = useSupabase()
  const { session } = useAuth()
  const service = new KnowledgeBaseService(supabase, session)

  return useQuery({
    queryKey: ['article', id],
    queryFn: () => service.getArticle(id),
    enabled: !!id && !!session
  })
}

/**
 * Hook for managing knowledge base categories
 */
export function useCategories() {
  const { supabase } = useSupabase()
  const service = new KnowledgeBaseCategoryService(supabase)

  return useQuery({
    queryKey: ['categories'],
    queryFn: () => service.listCategories()
  })
}

/**
 * Hook for managing knowledge base category mutations
 */
export function useCategoryMutations() {
  const { supabase } = useSupabase()
  const service = new KnowledgeBaseCategoryService(supabase)

  const createCategory = useMutation({
    mutationFn: (category: Omit<KnowledgeBaseCategory, 'id' | 'created_at' | 'updated_at'>) =>
      service.createCategory(category)
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<KnowledgeBaseCategory> }) =>
      service.updateCategory(id, updates)
  })

  const deleteCategory = useMutation({
    mutationFn: (id: string) => service.deleteCategory(id)
  })

  const updateCategoryOrder = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) =>
      service.updateCategoryOrder(id, newOrder)
  })

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder
  }
} 