import { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '../../components/common/button'
import { Skeleton } from '../../components/common/skeleton'
import { Alert, AlertDescription } from '../../components/common/alert'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { KnowledgeBaseCategory } from '../../services/knowledge-base-category.service'

interface CategoryNavigationProps {
  categories: KnowledgeBaseCategory[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
  error?: Error | null
}

export function CategoryNavigation({
  categories,
  selectedId,
  onSelect,
  isLoading,
  error
}: CategoryNavigationProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const getRootCategories = useCallback(() => {
    return categories.filter(category => !category.parent_id)
  }, [categories])

  const getChildCategories = useCallback((parentId: string) => {
    return categories.filter(category => category.parent_id === parentId)
  }, [categories])

  if (isLoading) {
    return (
      <div data-testid="category-nav-loading" className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (categories.length === 0) {
    return (
      <Alert>
        <AlertDescription>No categories available</AlertDescription>
      </Alert>
    )
  }

  const renderCategory = (category: KnowledgeBaseCategory) => {
    const children = getChildCategories(category.id!)
    const hasChildren = children.length > 0
    const isExpanded = hasChildren && expandedIds.has(category.id!)
    const isSelected = category.id === selectedId

    return (
      <div key={category.id} className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2',
            isSelected && 'bg-muted'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(category.id!)
            }
            onSelect(category.id!)
          }}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {hasChildren && (
            <span className="text-muted-foreground">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
          {category.name}
        </Button>
        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1">
            {children.map(child => renderCategory(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {getRootCategories().map(category => renderCategory(category))}
    </div>
  )
} 