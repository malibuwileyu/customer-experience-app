import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ArticleDetail } from '@/components/kb/ArticleDetail'
import { useArticles, useArticleMutations } from '@/hooks/knowledge-base/use-knowledge-base'
import { useAuth } from '@/contexts/AuthContext'
import type { KnowledgeBaseArticle } from '@/services/knowledge-base.service'

// Mock the hooks
vi.mock('@/hooks/knowledge-base/use-knowledge-base', () => ({
  useArticles: vi.fn(),
  useArticleMutations: vi.fn()
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('ArticleDetail', () => {
  const mockArticle: KnowledgeBaseArticle = {
    id: '1',
    title: 'Test Article',
    content: 'Test content',
    category_id: 'cat1',
    author_id: 'user1',
    created_at: '2024-02-19T00:00:00Z',
    updated_at: '2024-02-19T00:00:00Z'
  }

  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    full_name: 'Test User'
  }

  beforeEach(() => {
    vi.mocked(useArticles).mockReturnValue({
      data: [mockArticle],
      isLoading: false,
      isError: false,
      error: null
    } as any)

    vi.mocked(useArticleMutations).mockReturnValue({
      updateArticle: {
        mutateAsync: vi.fn()
      }
    } as any)

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser
    } as any)
  })

  it('renders article details', () => {
    render(<ArticleDetail articleId="1" />)
    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    vi.mocked(useArticles).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null
    } as any)

    render(<ArticleDetail articleId="1" />)
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('displays error state', () => {
    vi.mocked(useArticles).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('Test error')
    } as any)

    render(<ArticleDetail articleId="1" />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('displays not found message when article does not exist', () => {
    vi.mocked(useArticles).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<ArticleDetail articleId="1" />)
    expect(screen.getByText('Article not found')).toBeInTheDocument()
  })

  it('shows edit button when user is the author', () => {
    render(<ArticleDetail articleId="1" />)
    expect(screen.getByText('Edit Article')).toBeInTheDocument()
  })

  it('hides edit button when user is not the author', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockUser, id: 'other-user' }
    } as any)

    render(<ArticleDetail articleId="1" />)
    expect(screen.queryByText('Edit Article')).not.toBeInTheDocument()
  })

  it('navigates to edit page when edit button is clicked', () => {
    const mockPush = vi.fn()
    vi.mock('next/router', () => ({
      useRouter: () => ({
        push: mockPush
      })
    }))

    render(<ArticleDetail articleId="1" />)
    fireEvent.click(screen.getByText('Edit Article'))
    expect(mockPush).toHaveBeenCalledWith('/kb/articles/1/edit')
  })
}) 