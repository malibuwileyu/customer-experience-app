import { useState, useEffect } from 'react'
import { ArticleSearch, CategoryNavigation, ArticleList, CategoryManager, ArticleEditor } from '../../components/kb'
import { useCategories } from '../../hooks/knowledge-base/use-knowledge-base'
import { Button, Dialog, DialogContent, DialogTrigger } from '../../components/common'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabase'

export function KnowledgeBasePage() {
  // Get auth state from context
  const { user, isLoading: isLoadingAuth } = useAuth()
  
  // State for admin status
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoadingRole, setIsLoadingRole] = useState(true)
  
  // State for category and search
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useCategories()

  // Fetch user role from profiles
  useEffect(() => {
    async function fetchUserRole() {
      if (!user?.id) {
        setIsAdmin(false)
        setIsLoadingRole(false)
        return
      }

      try {
        const { data: profile, error } = await supabaseService
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user role:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(profile?.role === 'admin')
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error)
        setIsAdmin(false)
      } finally {
        setIsLoadingRole(false)
      }
    }

    setIsLoadingRole(true)
    fetchUserRole()
  }, [user?.id])

  // Log auth state
  useEffect(() => {
    console.log('[KB Page] Auth state:', {
      userId: user?.id,
      isLoadingAuth,
      isLoadingRole,
      isAdmin
    })
  }, [user, isLoadingAuth, isLoadingRole, isAdmin])

  // Don't render while loading
  if (isLoadingAuth || isLoadingRole) {
    console.log('[KB Page] Still loading', { isLoadingAuth, isLoadingRole })
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        {isAdmin && (
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Article</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <ArticleEditor onClose={() => {
                  const dialog = document.querySelector('dialog[open]') as HTMLDialogElement | null
                  if (dialog) {
                    dialog.close()
                  }
                }} />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Manage Categories</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <CategoryManager />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <div>
          <CategoryNavigation
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            isLoading={isLoadingCategories}
            error={categoriesError}
          />
        </div>
        <div className="space-y-8">
          <ArticleSearch 
            onSearch={setSearchTerm}
            onCategoryChange={setSelectedCategoryId}
            selectedCategory={selectedCategoryId}
          />
          <ArticleList 
            categoryId={selectedCategoryId || undefined}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </div>
  )
} 