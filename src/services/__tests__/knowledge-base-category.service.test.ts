import { describe, it, expect, beforeEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { KnowledgeBaseCategoryService } from '@/services/knowledge-base-category.service'
import type { Database } from '@/types/supabase'
import { mockSupabaseClient, createMockResponse, createMockListResponse, resetSupabaseMocks, setupMockTableQuery } from '@/__tests__/mocks/supabase'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}))

describe('KnowledgeBaseCategoryService', () => {
  let service: KnowledgeBaseCategoryService
  let mockSupabase: SupabaseClient<Database>

  beforeEach(() => {
    resetSupabaseMocks()
    mockSupabase = createClient('mock-url', 'mock-key')
    service = new KnowledgeBaseCategoryService(mockSupabase)
  })

  describe('createCategory', () => {
    it('should create a new category with the given data', async () => {
      const mockCategory = {
        name: 'Test Category',
        description: 'Test description',
        parent_id: null,
        display_order: 0
      }

      const mockResponse = createMockResponse({
        id: '123',
        ...mockCategory,
        created_at: '2024-01-19T00:00:00.000Z',
        updated_at: '2024-01-19T00:00:00.000Z'
      })

      const mockQueryBuilder = setupMockTableQuery('kb_categories', mockResponse)

      const result = await service.createCategory(mockCategory)

      expect(result).toEqual(mockResponse.data)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_categories')
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(mockCategory)
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.single).toHaveBeenCalled()
    })

    it('should throw an error if category creation fails', async () => {
      const mockCategory = {
        name: 'Test Category',
        description: 'Test description',
        parent_id: null,
        display_order: 0
      }

      const mockError = { message: 'Failed to create category' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_categories', mockErrorResponse)

      await expect(service.createCategory(mockCategory)).rejects.toThrow('Failed to create category')
    })
  })

  describe('getCategory', () => {
    it('should retrieve a category by id', async () => {
      const mockCategory = {
        id: '123',
        name: 'Test Category',
        description: 'Test description',
        parent_id: null,
        created_at: '2024-01-19T00:00:00.000Z',
        updated_at: '2024-01-19T00:00:00.000Z'
      }

      const mockResponse = createMockResponse(mockCategory)

      const mockQueryBuilder = setupMockTableQuery('kb_categories', mockResponse)

      const result = await service.getCategory('123')

      expect(result).toEqual(mockCategory)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_categories')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '123')
      expect(mockQueryBuilder.single).toHaveBeenCalled()
    })

    it('should throw an error if category retrieval fails', async () => {
      const mockError = { message: 'Category not found' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_categories', mockErrorResponse)

      await expect(service.getCategory('123')).rejects.toThrow('Category not found')
    })
  })

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const mockCategory = {
        id: '123',
        name: 'Updated Category',
        description: 'Updated description',
        parent_id: null,
        created_at: '2024-01-19T00:00:00.000Z',
        updated_at: '2024-01-19T00:00:00.000Z'
      }

      const mockResponse = createMockResponse(mockCategory)

      const mockQueryBuilder = setupMockTableQuery('kb_categories', mockResponse)

      const result = await service.updateCategory('123', {
        name: 'Updated Category',
        description: 'Updated description'
      })

      expect(result).toEqual(mockCategory)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_categories')
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        name: 'Updated Category',
        description: 'Updated description'
      })
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '123')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.single).toHaveBeenCalled()
    })

    it('should throw an error if category update fails', async () => {
      const mockError = { message: 'Failed to update category' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_categories', mockErrorResponse)

      await expect(service.updateCategory('123', {
        name: 'Updated Category',
        description: 'Updated description'
      })).rejects.toThrow('Failed to update category')
    })
  })

  describe('deleteCategory', () => {
    it('should delete a category by id', async () => {
      const mockResponse = createMockResponse({ id: '123' })

      const mockQueryBuilder = setupMockTableQuery('kb_categories', mockResponse)

      await service.deleteCategory('123')

      expect(mockSupabase.from).toHaveBeenCalledWith('kb_categories')
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '123')
    })

    it('should throw an error if category deletion fails', async () => {
      const mockError = { message: 'Failed to delete category' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_categories', mockErrorResponse)

      await expect(service.deleteCategory('123')).rejects.toThrow('Failed to delete category')
    })
  })

  describe('listCategories', () => {
    it('should retrieve a list of categories', async () => {
      const mockCategories = [
        {
          id: '123',
          name: 'Category 1',
          description: 'Description 1',
          parent_id: null,
          created_at: '2024-01-19T00:00:00.000Z',
          updated_at: '2024-01-19T00:00:00.000Z'
        },
        {
          id: '124',
          name: 'Category 2',
          description: 'Description 2',
          parent_id: '123',
          created_at: '2024-01-19T00:00:00.000Z',
          updated_at: '2024-01-19T00:00:00.000Z'
        }
      ]

      const mockResponse = createMockListResponse(mockCategories)

      const mockQueryBuilder = setupMockTableQuery('kb_categories', mockResponse)

      const result = await service.listCategories()

      expect(result).toEqual(mockCategories)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_categories')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('should throw an error if category listing fails', async () => {
      const mockError = { message: 'Failed to list categories' }
      const mockErrorResponse = createMockListResponse([], mockError)

      setupMockTableQuery('kb_categories', mockErrorResponse)

      await expect(service.listCategories()).rejects.toThrow('Failed to list categories')
    })
  })
}) 