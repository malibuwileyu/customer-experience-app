import { useArticles, useCategories } from '../../hooks/knowledge-base/use-knowledge-base'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/card'
import { Skeleton } from '../../components/common/skeleton'
import { Alert, AlertDescription } from '../../components/common/alert'
import { AlertCircle } from 'lucide-react'
import type { KnowledgeBaseArticle } from '../../services/knowledge-base.service'
import { Link } from 'react-router-dom'

interface ArticleListProps {
  categoryId?: string
  searchTerm?: string
}

export function ArticleList({ categoryId, searchTerm = '' }: ArticleListProps) {
  const { data: articles = [], isLoading, isError, error } = useArticles(categoryId)
  const { data: categories = [] } = useCategories()
  
  // Filter articles based on search term
  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true
    
    return article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           article.content.toLowerCase().includes(searchTerm.toLowerCase())
  })
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-[200px]" data-testid="skeleton" />
        ))}
      </div>
    )
  }
  
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load articles'}
        </AlertDescription>
      </Alert>
    )
  }
  
  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No articles found
      </div>
    )
  }

  // Get the current category name if we're in a category
  const currentCategory = categoryId ? categories.find(cat => cat.id === categoryId) : null
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          {currentCategory ? `${currentCategory.name} Articles` : 'All Articles'}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article: KnowledgeBaseArticle) => (
            <Link key={article.id} to={`/app/kb/articles/${article.id}`}>
              <Card className="h-full hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {article.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 