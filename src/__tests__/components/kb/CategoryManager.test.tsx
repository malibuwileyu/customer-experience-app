import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryManager } from '@/components/kb/CategoryManager'
import { useCategories, useCategoryMutations } from '@/hooks/knowledge-base/use-knowledge-base'
import type { KnowledgeBaseCategory } from '@/services/knowledge-base-category.service'
import type { UseMutationResult } from '@tanstack/react-query'

vi.mock('@/hooks/knowledge-base/use-knowledge-base')

const mockCategories: KnowledgeBaseCategory[] = [
  {
    id: '1',
    name: 'Test Category',
    description: 'Test Description',
    parent_id: null,
    created_at: '2024-02-01',
    updated_at: '2024-02-01',
    display_order: 1
  }
]

const mockMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  status: 'idle',
  isIdle: true,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  data: undefined,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  submittedAt: Date.now()
} as const

describe('CategoryManager', () => {
  beforeEach(() => {
    (useCategories as jest.Mock).mockReturnValue({
      data: mockCategories,
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isSuccess: true,
      status: 'success',
      isAuthenticated: true,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      isInitialLoading: false,
      promise: Promise.resolve(mockCategories)
    })

    ;(useCategoryMutations as jest.Mock).mockReturnValue({
      createCategory: mockMutation as UseMutationResult<KnowledgeBaseCategory, Error, Omit<KnowledgeBaseCategory, 'id' | 'created_at' | 'updated_at'>, unknown>,
      updateCategory: mockMutation as UseMutationResult<KnowledgeBaseCategory, Error, { id: string; updates: Partial<KnowledgeBaseCategory> }, unknown>,
      deleteCategory: mockMutation as UseMutationResult<void, Error, string, unknown>,
      updateCategoryOrder: mockMutation as UseMutationResult<void, Error, { id: string; newOrder: number }, unknown>,
      isAuthenticated: true
    })
  })

  it('renders category list', () => {
    render(<CategoryManager />)
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })
}) 