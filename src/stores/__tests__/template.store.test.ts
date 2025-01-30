/**
 * @fileoverview Tests for template store
 * @module stores/__tests__/template.store
 */

import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTemplateStore } from '../template.store'
import { templateService } from '../../services/template.service'
import type { Template, TemplateCategory } from '../../types/store/template.store'

// Mock template service
vi.mock('../../services/template.service', () => ({
  templateService: {
    getTemplates: vi.fn(),
    getTemplate: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    archiveTemplate: vi.fn(),
    incrementUsage: vi.fn(),
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn()
  }
}))

// Mock data
const mockTemplate = {
  id: 'test-id',
  title: 'Test Template',
  content: 'Test content',
  description: 'Test description',
  categoryId: 'test-category',
  variables: ['name', 'email'],
  tags: ['test'],
  usageCount: 0,
  createdAt: '2025-01-29T02:41:51.751Z',
  updatedAt: '2025-01-29T02:41:51.751Z',
  isArchived: false
}

const mockCategory = {
  id: 'test-category',
  name: 'Test Category',
  description: 'Test category description',
  createdAt: '2025-01-29T02:41:51.751Z',
  updatedAt: '2025-01-29T02:41:51.751Z'
}

const mockTemplates = [mockTemplate]
const mockCategories = [mockCategory]

describe('Template Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const store = useTemplateStore.getState()
    store.reset()

    // Setup mock implementations
    vi.mocked(templateService.getTemplates).mockResolvedValue([...mockTemplates])
    vi.mocked(templateService.getTemplate).mockResolvedValue({...mockTemplate})
    vi.mocked(templateService.createTemplate).mockResolvedValue({...mockTemplate})
    vi.mocked(templateService.updateTemplate).mockResolvedValue({ ...mockTemplate, title: 'Updated Title' })
    vi.mocked(templateService.archiveTemplate).mockResolvedValue({ ...mockTemplate, isArchived: true })
    vi.mocked(templateService.incrementUsage).mockResolvedValue({ ...mockTemplate, usageCount: 1 })
    vi.mocked(templateService.getCategories).mockResolvedValue([...mockCategories])
    vi.mocked(templateService.createCategory).mockResolvedValue({...mockCategory})
    vi.mocked(templateService.updateCategory).mockResolvedValue({ ...mockCategory, name: 'Updated Name' })
    vi.mocked(templateService.deleteCategory).mockResolvedValue()
  })

  describe('Template Operations', () => {
    it('should fetch templates', async () => {
      const store = useTemplateStore.getState()
      await store.fetchTemplates()

      expect(templateService.getTemplates).toHaveBeenCalled()
      expect(store.templates).toEqual(mockTemplates)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should fetch template by id', async () => {
      const store = useTemplateStore.getState()
      await store.fetchTemplateById('test-id')

      expect(templateService.getTemplate).toHaveBeenCalledWith('test-id')
      expect(store.selectedTemplate).toEqual(mockTemplate)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should create template', async () => {
      const store = useTemplateStore.getState()
      const templateData = {
        title: 'Test Template',
        content: 'Test content',
        description: 'Test description',
        categoryId: 'test-category',
        variables: ['name', 'email'],
        tags: ['test']
      }
      await store.createTemplate(templateData)

      expect(templateService.createTemplate).toHaveBeenCalledWith(templateData)
      expect(store.templates).toContainEqual(mockTemplate)
      expect(store.isCreating).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should update template', async () => {
      const store = useTemplateStore.getState()
      store.selectTemplate(mockTemplate)
      const updateData = { title: 'Updated Title' }
      await store.updateTemplate('test-id', updateData)

      expect(templateService.updateTemplate).toHaveBeenCalledWith('test-id', updateData)
      expect(store.templates[0]?.title).toBe('Updated Title')
      expect(store.selectedTemplate?.title).toBe('Updated Title')
      expect(store.isUpdating).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should archive template', async () => {
      const store = useTemplateStore.getState()
      store.selectTemplate(mockTemplate)
      await store.archiveTemplate('test-id')

      expect(templateService.archiveTemplate).toHaveBeenCalledWith('test-id')
      expect(store.templates).toHaveLength(0)
      expect(store.selectedTemplate).toBeNull()
      expect(store.isUpdating).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should increment usage count', async () => {
      const store = useTemplateStore.getState()
      store.selectTemplate(mockTemplate)
      await store.incrementUsage('test-id')

      expect(templateService.incrementUsage).toHaveBeenCalledWith('test-id')
      expect(store.templates[0]?.usageCount).toBe(1)
      expect(store.selectedTemplate?.usageCount).toBe(1)
      expect(store.error).toBeNull()
    })
  })

  describe('Category Operations', () => {
    it('should fetch categories', async () => {
      const store = useTemplateStore.getState()
      await store.fetchCategories()

      expect(templateService.getCategories).toHaveBeenCalled()
      expect(store.categories).toEqual(mockCategories)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should create category', async () => {
      const store = useTemplateStore.getState()
      const name = 'Test Category'
      const description = 'Test description'
      await store.createCategory(name, description)

      expect(templateService.createCategory).toHaveBeenCalledWith(name, description)
      expect(store.categories).toContainEqual(mockCategory)
      expect(store.isCreating).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should update category', async () => {
      const store = useTemplateStore.getState()
      store.selectCategory(mockCategory)
      const newName = 'Updated Name'
      await store.updateCategory('test-category', newName)

      expect(templateService.updateCategory).toHaveBeenCalledWith('test-category', newName)
      expect(store.categories[0]?.name).toBe('Updated Name')
      expect(store.selectedCategory?.name).toBe('Updated Name')
      expect(store.isUpdating).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should delete category', async () => {
      const store = useTemplateStore.getState()
      store.selectCategory(mockCategory)
      await store.deleteCategory('test-category')

      expect(templateService.deleteCategory).toHaveBeenCalledWith('test-category')
      expect(store.categories).toHaveLength(0)
      expect(store.selectedCategory).toBeNull()
      expect(store.isUpdating).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Selection', () => {
    it('should select and clear template', () => {
      const store = useTemplateStore.getState()
      
      store.selectTemplate(mockTemplate)
      expect(store.selectedTemplate).toEqual(mockTemplate)

      store.selectTemplate(null)
      expect(store.selectedTemplate).toBeNull()
    })

    it('should select and clear category', () => {
      const store = useTemplateStore.getState()
      
      store.selectCategory(mockCategory)
      expect(store.selectedCategory).toEqual(mockCategory)

      store.selectCategory(null)
      expect(store.selectedCategory).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch error', async () => {
      const error = new Error('Fetch failed')
      vi.mocked(templateService.getTemplates).mockRejectedValue(error)

      const store = useTemplateStore.getState()
      await store.fetchTemplates()

      expect(store.error).toEqual(error)
      expect(store.isLoading).toBe(false)
    })

    it('should handle create error', async () => {
      const error = new Error('Create failed')
      vi.mocked(templateService.createTemplate).mockRejectedValue(error)

      const store = useTemplateStore.getState()
      await store.createTemplate({
        title: 'Test Template',
        content: 'Test content',
        description: 'Test description',
        categoryId: 'test-category',
        variables: ['name', 'email'],
        tags: ['test']
      })

      expect(store.error).toEqual(error)
      expect(store.isCreating).toBe(false)
    })

    it('should reset store state', () => {
      const store = useTemplateStore.getState()
      
      store.selectTemplate(mockTemplate)
      store.selectCategory(mockCategory)
      store.setError(new Error('Test error'))

      store.reset()

      expect(store.templates).toEqual([])
      expect(store.categories).toEqual([])
      expect(store.selectedTemplate).toBeNull()
      expect(store.selectedCategory).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.isCreating).toBe(false)
      expect(store.isUpdating).toBe(false)
      expect(store.error).toBeNull()
    })
  })
}) 
