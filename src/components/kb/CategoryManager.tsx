import { useState } from 'react'
import { useCategories, useCategoryMutations } from '../../hooks/knowledge-base/use-knowledge-base'
import { Button } from '../../components/common/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { Textarea } from '../../components/common/textarea'
import { FormSelect } from '../../components/common/form-select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { KnowledgeBaseCategory } from '../../services/knowledge-base-category.service'
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { useToast } from '../../hooks/use-toast'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  parent_id: z.string().nullable()
})

type CategoryFormData = z.infer<typeof categorySchema>

interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

interface CategoryNode extends KnowledgeBaseCategory {
  children: CategoryNode[]
}

function buildCategoryTree(categories: KnowledgeBaseCategory[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  // First pass: create nodes
  categories.forEach(category => {
    categoryMap.set(category.id!, {
      ...category,
      children: []
    })
  })

  // Second pass: build tree
  categories.forEach(category => {
    const node = categoryMap.get(category.id!)!
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
}

function flattenCategoryTree(nodes: CategoryNode[], level = 0): SelectOption[] {
  return nodes.reduce<SelectOption[]>((acc, node) => {
    // Add the current node
    acc.push({
      label: `${'\u00A0\u00A0'.repeat(level)}${node.name}`,
      value: node.id ?? '',
      disabled: false
    })
    
    // Add children recursively
    if (node.children.length > 0) {
      acc.push(...flattenCategoryTree(node.children, level + 1))
    }
    
    return acc
  }, [])
}

function CategoryItem({ 
  category, 
  level = 0,
  onEdit,
  onDelete,
  onMove,
  isFirst,
  isLast,
  allCategories
}: { 
  category: CategoryNode
  level?: number
  onEdit: (category: KnowledgeBaseCategory) => void
  onDelete: (category: KnowledgeBaseCategory) => void
  onMove: (category: KnowledgeBaseCategory, direction: 'up' | 'down') => void
  isFirst: boolean
  isLast: boolean
  allCategories: KnowledgeBaseCategory[]
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = category.children.length > 0

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between p-2 bg-white rounded-lg shadow hover:bg-gray-50"
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-full transition-transform duration-200"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
              }}
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <div className="flex-1">
            <h3 className="font-medium">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-500">{category.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(category, 'up')}
            disabled={isFirst}
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(category, 'down')}
            disabled={isLast}
          >
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => onEdit(category)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(category)}
          >
            Delete
          </Button>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {category.children.map((child, index) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              isFirst={index === 0}
              isLast={index === category.children.length - 1}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryManager() {
  const { data: categories = [], isLoading, isError } = useCategories()
  const { createCategory, updateCategory, deleteCategory, updateCategoryOrder } = useCategoryMutations()
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeBaseCategory | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parent_id: null
    }
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync({
          id: selectedCategory.id!,
          updates: {
            ...data,
            description: data.description || ''
          }
        })
        setIsEditDialogOpen(false)
        toast.success('Category updated successfully')
      } else {
        const maxOrder = Math.max(...(categories?.map(c => c.display_order ?? 0) ?? [0]))
        await createCategory.mutateAsync({
          ...data,
          description: data.description || '',
          display_order: maxOrder + 1
        })
        setIsCreateDialogOpen(false)
        toast.success('Category created successfully')
      }
      form.reset()
    } catch (error) {
      console.error('Failed to save category:', error)
      const message = error instanceof Error && error.message === 'Authentication required'
        ? 'You must be logged in to manage categories'
        : 'Failed to save category. Please try again.'
      
      toast.error(message)
    }
  }

  const handleDelete = () => {
    if (selectedCategory?.id) {
      deleteCategory.mutate(selectedCategory.id)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEdit = (category: KnowledgeBaseCategory) => {
    setSelectedCategory(category)
    form.reset({
      name: category.name,
      description: category.description,
      parent_id: category.parent_id
    })
    setIsEditDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    form.reset({
      name: '',
      description: null,
      parent_id: null
    })
    setIsCreateDialogOpen(true)
  }

  const handleMoveCategory = async (category: KnowledgeBaseCategory, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categories.length) return
    
    const targetOrder = categories[newIndex].display_order ?? 0
    try {
      await updateCategoryOrder.mutateAsync({
        id: category.id!,
        newOrder: targetOrder
      })
    } catch (error) {
      console.error('Failed to update category order:', error)
    }
  }

  const categoryOptions: SelectOption[] = [
    { label: 'None', value: '' },
    ...flattenCategoryTree(buildCategoryTree(categories))
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return (
      <div data-testid="category-error" className="text-red-500">
        Failed to load categories
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={handleCreate}>Create Category</Button>
      </div>

      <div className="space-y-2 max-h-[calc(90vh-8rem)] overflow-y-auto">
        {buildCategoryTree(categories).map((category, index) => (
          <CategoryItem
            key={category.id}
            category={category}
            onEdit={handleEdit}
            onDelete={(category) => {
              setSelectedCategory(category)
              setIsDeleteDialogOpen(true)
            }}
            onMove={handleMoveCategory}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
            allCategories={categories}
          />
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Create a new knowledge base category.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              role="form"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    label="Parent Category"
                    options={categoryOptions}
                    value={field.value || ''}
                  />
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {selectedCategory ? 'Update' : 'Create'} Category
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Edit the category details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              role="form"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    label="Parent Category"
                    options={categoryOptions}
                    value={field.value || ''}
                  />
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Category</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 