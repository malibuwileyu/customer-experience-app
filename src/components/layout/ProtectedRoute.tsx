/**
 * @fileoverview Protected route wrapper component
 * @module components/layout/ProtectedRoute
 * @description
 * Handles route protection based on authentication and role requirements.
 * Redirects unauthorized users to appropriate pages.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRoles } from '@/hooks/auth/useUserRoles'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()
  const { roles, isLoading: rolesLoading } = useUserRoles(user?.id)
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)

  useEffect(() => {
    // Log state for debugging
    // console.error('[DEBUG] ProtectedRoute state:', {
    //   path: location.pathname,
    //   user: user?.id,
    //   userRoles: roles,
    //   allowedRoles,
    //   authLoading,
    //   rolesLoading
    // })

    // Reset redirect state
    setShouldRedirect(null)

    // Handle redirects with a slight delay for debugging
    if (!authLoading && !rolesLoading) {
      if (!user) {
        // console.error('[DEBUG] No user found - will redirect to login')
        setShouldRedirect(redirectTo)
      } else if (allowedRoles.length > 0) {
        // Normalize roles to lowercase for comparison
        const normalizedUserRoles = roles.map(r => r.toLowerCase())
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase())
        
        const hasRequiredRole = normalizedUserRoles.some(role => 
          normalizedAllowedRoles.includes(role)
        )
        
        // console.error('[DEBUG] Role check result:', {
        //   normalizedUserRoles,
        //   normalizedAllowedRoles,
        //   hasRequiredRole
        // })
        
        if (!hasRequiredRole) {
          // console.error('[DEBUG] User lacks required role - will redirect to default page')
          // If user is admin, redirect to admin dashboard, otherwise to regular dashboard
          const defaultPath = normalizedUserRoles.includes('admin') 
            ? '/app/admin/dashboard' 
            : '/app/dashboard'
          setShouldRedirect(defaultPath)
        } else {
          // console.error('[DEBUG] User has required role - allowing access')
        }
      }
    }
  }, [user, roles, allowedRoles, redirectTo, authLoading, rolesLoading, location])

  // Show nothing while loading to prevent flash of wrong content
  if (authLoading || rolesLoading) {
    // console.error('[DEBUG] Still loading auth or roles')
    return null
  }

  // Handle redirects
  if (shouldRedirect) {
    // console.error('[DEBUG] Redirecting to:', shouldRedirect)
    return <Navigate to={shouldRedirect} state={{ from: location }} replace />
  }

  // No role requirements - allow access
  if (allowedRoles.length === 0) {
    // console.error('[DEBUG] No role requirements - allowing access')
    return <>{children}</>
  }

  // User is authenticated and authorized
  // console.error('[DEBUG] User is authenticated and authorized')
  return <>{children}</>
} 
