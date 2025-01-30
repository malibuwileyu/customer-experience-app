import { useState } from 'react'
import { useArticleMutations, useCategories } from '../../hooks/knowledge-base/use-knowledge-base'
import { Button } from '../../components/common/button'
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '../../components/common/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/common/form'
import { Input } from '../../components/common/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '../../hooks/use-toast'
import { RichTextEditor } from '../kb/RichTextEditor'
import { useAuth } from '../../contexts/AuthContext'

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category_id: z.string().min(1, 'Category is required'),
  author_id: z.string()
})

type ArticleFormData = z.infer<typeof articleSchema>

interface ArticleEditorProps {
  article?: {
    id: string
    title: string
    content: string
    category_id: string
    author_id: string
  }
  onClose: () => void
}

export function ArticleEditor({ article, onClose }: ArticleEditorProps) {
  const { createArticle, updateArticle } = useArticleMutations()
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories()
  const { user, session } = useAuth()
  const { error: toastError, success: toastSuccess } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect or show error if no session
  if (!session || !user) {
    toastError('You must be logged in to manage articles')
    onClose()
    return null
  }

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title ?? '',
      content: article?.content ?? '',
      category_id: article?.category_id ?? '',
      author_id: user.id // Always set to current user's ID
    }
  })

  const onSubmit = async (data: ArticleFormData) => {
    if (!session || !user) {
      toastError('You must be logged in to manage articles')
      return
    }

    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      
      // Ensure author_id is set to current user
      const articleData = {
        ...data,
        author_id: user.id
      }

      if (article?.id) {
        await updateArticle.mutateAsync({
          id: article.id,
          updates: articleData
        })
        toastSuccess('Article updated successfully')
      } else {
        await createArticle.mutateAsync(articleData)
        toastSuccess('Article created successfully')
      }
      onClose()
      form.reset()
    } catch (error) {
      console.error('Failed to save article:', error)
      const message = error instanceof Error ? error.message : 'Failed to save article. Please try again.'
      toastError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryOptions = categories.map(category => ({
    label: category.name,
    value: category.id ?? ''
  }))

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{article ? 'Edit Article' : 'Create Article'}</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter article title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    disabled={isLoadingCategories}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <div className="h-[calc(100vh-400px)] min-h-[300px] overflow-y-auto prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none cursor-text">
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your article content here..."
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : article ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  )
} 