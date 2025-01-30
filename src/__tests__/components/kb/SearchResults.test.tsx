import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SearchResults } from '../../../components/kb/SearchResults'
import type { KnowledgeBaseArticle } from '@/services/knowledge-base.service'

// Mock next/link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
}))

describe('SearchResults', () => {
  const mockArticles: KnowledgeBaseArticle[] = [
    {
      id: '1',
      title: 'Getting Started Guide',
      content: 'This is a guide to help you get started with our platform.',
      category_id: 'cat1',
      author_id: 'user1',
      created_at: '2024-02-19T00:00:00Z',
      updated_at: '2024-02-19T00:00:00Z'
    },
    {
      id: '2',
      title: 'Advanced Features',
      content: 'Learn about advanced features and capabilities.',
      category_id: 'cat2',
      author_id: 'user1',
      created_at: '2024-02-19T00:00:00Z',
      updated_at: '2024-02-19T00:00:00Z'
    }
  ]

  it('renders articles correctly', () => {
    render(<SearchResults articles={mockArticles} isLoading={false} error={null} />)

    expect(screen.getByText('Getting Started Guide')).toBeInTheDocument()
    expect(screen.getByText('Advanced Features')).toBeInTheDocument()
    expect(screen.getByText(/This is a guide/)).toBeInTheDocument()
    expect(screen.getByText(/Learn about advanced features/)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<SearchResults articles={[]} isLoading={true} error={null} />)
    const skeletons = screen.getAllByTestId('search-result-skeleton')
    expect(skeletons).toHaveLength(3)
  })

  it('shows error state', () => {
    render(<SearchResults articles={[]} isLoading={false} error={new Error('Failed to load articles')} />)
    expect(screen.getByText(/failed to load articles/i)).toBeInTheDocument()
  })

  it('shows no results message when articles array is empty', () => {
    render(<SearchResults articles={[]} isLoading={false} error={null} />)
    expect(screen.getByText(/no articles found/i)).toBeInTheDocument()
  })

  it('renders article links with correct href', () => {
    render(<SearchResults articles={mockArticles} isLoading={false} error={null} />)

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/kb/articles/1')
    expect(links[1]).toHaveAttribute('href', '/kb/articles/2')
  })

  it('renders article metadata', () => {
    render(<SearchResults articles={mockArticles} isLoading={false} error={null} />)
    const dateString = new Date('2024-02-19T00:00:00Z').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    expect(screen.getAllByText(dateString)).toHaveLength(2)
  })

  it('truncates long content in excerpts', () => {
    const longArticle: KnowledgeBaseArticle = {
      ...mockArticles[0],
      content: 'This is a very long article content that should be truncated in the excerpt view. ' +
        'We want to make sure that only a portion of the content is shown to keep the UI clean and consistent.'
    }

    render(<SearchResults articles={[longArticle]} isLoading={false} error={null} />)

    const excerpt = screen.getByText(/This is a very long article content/)
    expect(excerpt.textContent).toHaveLength(153) // Account for ellipsis
  })

  it('renders articles with metadata', () => {
    const articles = [
      {
        id: '1',
        title: 'Getting Started Guide',
        content: 'This is a guide to help you get started with our platform. It covers all the basic features and functionality you need to know to begin using the system effectively.',
        created_at: '2024-02-19T12:00:00Z',
        category_id: '1',
        author_id: '1'
      }
    ]
    
    render(<SearchResults articles={articles} isLoading={false} error={null} />)
    
    expect(screen.getByText('Getting Started Guide')).toBeInTheDocument()
    expect(screen.getByText('Feb 19, 2024')).toBeInTheDocument()
    
    const excerpt = screen.getByText(/This is a guide to help you get started with our platform/)
    expect(excerpt.textContent?.length).toBeLessThanOrEqual(153) // Account for ellipsis
  })
}) 