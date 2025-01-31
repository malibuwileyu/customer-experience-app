import { useCallback, useEffect } from 'react'
import { useArticles, useArticleMutations } from '../../hooks/knowledge-base/use-knowledge-base'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Alert, AlertDescription, Button, Skeleton } from '../../components/common'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { RichTextEditor } from './RichTextEditor'
import { Article } from '../../types/models/kb.model'

interface ArticleDetailProps {
  articleId: string
}

export function ArticleDetail({ articleId }: ArticleDetailProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: articles = [], isLoading, isError, error } = useArticles()
  const { updateArticle } = useArticleMutations()
  
  const article = articles.find(a => a.id === articleId) as Article | undefined
  
  const handleEdit = useCallback(() => {
    navigate(`/kb/articles/${articleId}/edit`)
  }, [articleId, navigate])
  
  const handleViewCountUpdate = useCallback(async () => {
    if (article?.id) {
      await updateArticle.mutateAsync({
        id: article.id,
        updates: {
          view_count: (article.view_count || 0) + 1
        }
      })
    }
  }, [article?.id, article?.view_count, updateArticle])

  useEffect(() => {
    handleViewCountUpdate()
  }, [handleViewCountUpdate])
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Article not found</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-3xl">{article.title}</CardTitle>
            <CardDescription>
              By {article.author?.full_name || 'Unknown'} • 
              {article.created_at && new Date(article.created_at).toLocaleDateString()}
              {article.updated_at && article.updated_at !== article.created_at && 
                ` • Updated ${new Date(article.updated_at).toLocaleDateString()}`}
            </CardDescription>
          </div>
          {user?.id === article.author_id && (
            <Button onClick={handleEdit} variant="outline">
              Edit Article
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <RichTextEditor
          value={article.content}
          onChange={() => {}}
          readOnly={true}
          aria-label="Article content"
        />
      </CardContent>
    </Card>
  )
} 