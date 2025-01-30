import { describe, it, expect, beforeEach } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { KnowledgeBaseService, KnowledgeBaseArticle } from '@/services/knowledge-base.service'
import type { Database } from '@/types/supabase'
import { mockSupabaseClient, createMockResponse, createMockListResponse, resetSupabaseMocks, setupMockTableQuery } from '@/__tests__/mocks/supabase'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}))

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService
  let mockSupabase: SupabaseClient<Database>

  beforeEach(() => {
    resetSupabaseMocks()
    mockSupabase = createClient('mock-url', 'mock-key')
    service = new KnowledgeBaseService(mockSupabase)
  })

  describe('createArticle', () => {
    it('should create a new article with the given data', async () => {
      const mockArticle: Omit<KnowledgeBaseArticle, 'id' | 'created_at' | 'updated_at'> = {
        title: 'Test Article',
        content: 'Test content',
        category_id: '123',
        author_id: '456'
      }

      const mockResponse = createMockResponse({
        id: '789',
        ...mockArticle,
        created_at: '2024-01-19T00:00:00.000Z',
        updated_at: '2024-01-19T00:00:00.000Z'
      })

      const mockQueryBuilder = setupMockTableQuery('kb_articles', mockResponse)

      const result = await service.createArticle(mockArticle)

      expect(result).toEqual(mockResponse.data)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_articles')
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(mockArticle)
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.single).toHaveBeenCalled()
    })

    it('should throw an error if article creation fails', async () => {
      const mockArticle = {
        title: 'Test Article',
        content: 'Test content',
        category_id: '123',
        author_id: '456'
      }

      const mockError = { message: 'Failed to create article' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_articles', mockErrorResponse)

      await expect(service.createArticle(mockArticle)).rejects.toThrow('Failed to create article')
    })
  })

  describe('getArticle', () => {
    it('should retrieve an article by id', async () => {
      const mockArticle = {
        id: '789',
        title: 'Test Article',
        content: 'Test content',
        category_id: '123',
        author_id: '456',
        created_at: '2024-01-19T00:00:00.000Z',
        updated_at: '2024-01-19T00:00:00.000Z'
      }

      const mockResponse = createMockResponse(mockArticle)

      const mockQueryBuilder = setupMockTableQuery('kb_articles', mockResponse)

      const result = await service.getArticle('789')

      expect(result).toEqual(mockArticle)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_articles')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '789')
      expect(mockQueryBuilder.single).toHaveBeenCalled()
    })

    it('should throw an error if article retrieval fails', async () => {
      const mockError = { message: 'Article not found' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_articles', mockErrorResponse)

      await expect(service.getArticle('789')).rejects.toThrow('Article not found')
    })
  })

  describe('updateArticle', () => {
    it('should update an existing article', async () => {
      const mockArticle = {
        id: '789',
        title: 'Updated Title',
        content: 'Updated content',
        category_id: '123',
        author_id: '456',
        created_at: '2024-01-19T00:00:00.000Z',
        updated_at: '2024-01-19T00:00:00.000Z'
      }

      const mockResponse = createMockResponse(mockArticle)

      const mockQueryBuilder = setupMockTableQuery('kb_articles', mockResponse)

      const result = await service.updateArticle('789', {
        title: 'Updated Title',
        content: 'Updated content'
      })

      expect(result).toEqual(mockArticle)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_articles')
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        content: 'Updated content'
      })
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '789')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.single).toHaveBeenCalled()
    })

    it('should throw an error if article update fails', async () => {
      const mockError = { message: 'Failed to update article' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_articles', mockErrorResponse)

      await expect(service.updateArticle('789', {
        title: 'Updated Title',
        content: 'Updated content'
      })).rejects.toThrow('Failed to update article')
    })
  })

  describe('deleteArticle', () => {
    it('should delete an article by id', async () => {
      const mockResponse = createMockResponse({ id: '789' })

      const mockQueryBuilder = setupMockTableQuery('kb_articles', mockResponse)

      await service.deleteArticle('789')

      expect(mockSupabase.from).toHaveBeenCalledWith('kb_articles')
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '789')
    })

    it('should throw an error if article deletion fails', async () => {
      const mockError = { message: 'Failed to delete article' }
      const mockErrorResponse = createMockResponse(null, mockError)

      setupMockTableQuery('kb_articles', mockErrorResponse)

      await expect(service.deleteArticle('789')).rejects.toThrow('Failed to delete article')
    })
  })

  describe('listArticles', () => {
    it('should retrieve a list of articles with optional filters', async () => {
      const mockArticles = [
        {
          id: '789',
          title: 'Test Article 1',
          content: 'Test content 1',
          category_id: '123',
          author_id: '456',
          created_at: '2024-01-19T00:00:00.000Z',
          updated_at: '2024-01-19T00:00:00.000Z'
        },
        {
          id: '790',
          title: 'Test Article 2',
          content: 'Test content 2',
          category_id: '123',
          author_id: '456',
          created_at: '2024-01-19T00:00:00.000Z',
          updated_at: '2024-01-19T00:00:00.000Z'
        }
      ]

      const mockResponse = createMockListResponse(mockArticles)

      const mockQueryBuilder = setupMockTableQuery('kb_articles', mockResponse)

      const result = await service.listArticles({ category_id: '123' })

      expect(result).toEqual(mockArticles)
      expect(mockSupabase.from).toHaveBeenCalledWith('kb_articles')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('category_id', '123')
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should throw an error if article listing fails', async () => {
      const mockError = { message: 'Failed to list articles' }
      const mockErrorResponse = createMockListResponse([], mockError)

      setupMockTableQuery('kb_articles', mockErrorResponse)

      await expect(service.listArticles()).rejects.toThrow('Failed to list articles')
    })
  })
}) 