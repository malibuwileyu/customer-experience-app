/**
 * @fileoverview Dashboard layout component
 * @module components/layout/DashboardLayout
 * @description
 * Main layout component for the dashboard, providing consistent
 * structure and navigation across dashboard pages.
 */

import { Outlet } from 'react-router-dom'
import { DashboardNavigation } from './DashboardNavigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRoles } from '@/hooks/auth/useUserRoles'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isLoading: authLoading } = useAuth()
  const { isLoading: rolesLoading } = useUserRoles(user?.id)

  // Show loading state while auth or roles are loading
  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Temporarily only check for user presence during debugging
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <h1 className="text-xl font-bold">Customer Experience</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar Navigation */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <DashboardNavigation />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex w-full flex-col overflow-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
} 
