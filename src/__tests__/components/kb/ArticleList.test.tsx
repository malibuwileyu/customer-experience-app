import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleList } from '@/components/kb/ArticleList'
import { useArticles } from '@/hooks/knowledge-base/use-knowledge-base'
import type { KnowledgeBaseArticle } from '@/services/knowledge-base.service'

// Mock the hooks
vi.mock('@/hooks/knowledge-base/use-knowledge-base', () => ({
  useArticles: vi.fn()
}))

// Mock next/link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
}))

describe('ArticleList', () => {
  const mockArticles: KnowledgeBaseArticle[] = [
    {
      id: '1',
      title: 'Test Article 1',
      content: 'Test content 1',
      category_id: 'cat1',
      author_id: 'user1',
      created_at: '2024-02-19T00:00:00Z',
      updated_at: '2024-02-19T00:00:00Z'
    },
    {
      id: '2',
      title: 'Test Article 2',
      content: 'Test content 2',
      category_id: 'cat2',
      author_id: 'user1',
      created_at: '2024-02-19T00:00:00Z',
      updated_at: '2024-02-19T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.mocked(useArticles).mockReturnValue({
      data: mockArticles,
      isLoading: false,
      isError: false,
      error: null
    } as any)
  })

  it('renders a list of articles', () => {
    render(<ArticleList />)
    expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    expect(screen.getByText('Test Article 2')).toBeInTheDocument()
  })

  it('filters articles by category', () => {
    render(<ArticleList categoryId="cat1" />)
    expect(vi.mocked(useArticles)).toHaveBeenCalledWith('cat1')
  })

  it('displays loading state', () => {
    vi.mocked(useArticles).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null
    } as any)

    render(<ArticleList />)
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('displays error state', () => {
    vi.mocked(useArticles).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('Test error')
    } as any)

    render(<ArticleList />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('displays no articles message when list is empty', () => {
    vi.mocked(useArticles).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null
    } as any)

    render(<ArticleList />)
    expect(screen.getByText('No articles found')).toBeInTheDocument()
  })

  it('renders article links with correct href', () => {
    render(<ArticleList />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/kb/articles/1')
    expect(links[1]).toHaveAttribute('href', '/kb/articles/2')
  })
}) 