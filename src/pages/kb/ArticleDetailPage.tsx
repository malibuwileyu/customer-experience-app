import { useParams } from 'react-router-dom'
import { useArticle, useArticleMutations } from '../../hooks/knowledge-base/use-knowledge-base'
import { Button } from '../../components/common/button'
import { Skeleton } from '../../components/common/skeleton'
import { Alert, AlertDescription } from '../../components/common/alert'
import { AlertCircle, Eye } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: article, isLoading, isError, error } = useArticle(id!)
  const { incrementViewCount } = useArticleMutations()
  const { user } = useAuth()

  // Increment view count when article is loaded
  useEffect(() => {
    if (article?.id) {
      incrementViewCount.mutate(article.id)
    }
  }, [article?.id])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load article'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!article) {
    return (
      <Alert>
        <AlertDescription>Article not found</AlertDescription>
      </Alert>
    )
  }

  const isAuthor = user?.id === article.author_id

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{article.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{article.view_count || 0} views</span>
            </div>
          </div>
          {isAuthor && (
            <Button variant="outline">Edit Article</Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(article.updated_at!).toLocaleDateString()}
        </div>

        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto" 
             dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </div>
  )
} 