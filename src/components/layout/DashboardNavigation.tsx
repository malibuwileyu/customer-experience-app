/**
 * @fileoverview Dashboard navigation component
 * @module components/layout/DashboardNavigation
 * @description
 * Main navigation component for the dashboard, providing links to
 * different sections based on user roles.
 */

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRoles } from '@/hooks/auth/useUserRoles'

// Define role requirements for each feature
const FEATURE_ROLES = {
  outreach: ['admin', 'support_agent', 'team_lead', 'support_manager'],
  teams: ['admin', 'team_lead'],
  roles: ['admin'],
  knowledgeBase: ['admin', 'support_agent', 'team_lead', 'support_manager'],
} as const

export const DashboardNavigation = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { roles } = useUserRoles(user?.id)

  // Check if user has any of the required roles
  const hasAccess = (requiredRoles: readonly string[]) => {
    return roles.some(role => requiredRoles.includes(role))
  }

  // Get active state for links
  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="space-y-1">
      {/* Dashboard Home */}
      <Link
        to="/app/dashboard"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
          isActive('/app/dashboard')
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted'
        }`}
      >
        <span>Dashboard</span>
      </Link>

      {/* OutreachGPT - Show if user has required role */}
      {hasAccess(FEATURE_ROLES.outreach) && (
        <Link
          to="/app/outreach"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            isActive('/app/outreach')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>OutreachGPT</span>
        </Link>
      )}

      {/* Teams - Show for admins and team leads */}
      {hasAccess(FEATURE_ROLES.teams) && (
        <Link
          to="/teams"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            isActive('/teams')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>Teams</span>
        </Link>
      )}

      {/* Knowledge Base */}
      {hasAccess(FEATURE_ROLES.knowledgeBase) && (
        <Link
          to="/kb"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            isActive('/kb')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>Knowledge Base</span>
        </Link>
      )}

      {/* Role Management - Admin only */}
      {hasAccess(FEATURE_ROLES.roles) && (
        <Link
          to="/admin/roles"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            isActive('/admin/roles')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>Role Management</span>
        </Link>
      )}
    </nav>
  )
} 