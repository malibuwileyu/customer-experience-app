import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/card'
import { Link } from 'react-router-dom'
import type { KnowledgeBaseArticle } from '@/services/knowledge-base.service'

interface SearchResultsProps {
  articles: KnowledgeBaseArticle[]
  isLoading: boolean
  error: Error | null
  searchTerm?: string
  categoryId?: string
}

export function SearchResults({ articles, isLoading, error, searchTerm = '', categoryId }: SearchResultsProps) {
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !categoryId || article.category_id === categoryId
    
    return matchesSearch && matchesCategory
  })
  
  function formatDate(date: string | undefined) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function getExcerpt(content: string) {
    if (content.length <= 150) return content
    return content.substring(0, 150) + '...'
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (filteredArticles.length === 0) {
    return <div>No articles found</div>
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredArticles.map(article => (
        <Link key={article.id} to={`/kb/articles/${article.id}`}>
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="line-clamp-2">{article.title}</CardTitle>
              <CardDescription>
                {formatDate(article.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {getExcerpt(article.content)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 