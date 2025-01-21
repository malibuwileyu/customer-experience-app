/**
 * @fileoverview Protected route wrapper component for authentication and role-based access control
 * @module components/auth/ProtectedRoute
 * @description
 * This component wraps routes that require authentication and/or specific user roles.
 * It handles:
 * - Authentication checks
 * - Role-based access control
 * - Loading states
 * - Redirection to login or unauthorized pages
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRoles } from '../../hooks/auth/useUserRoles';
import type { ProtectedRouteProps } from '../../types/auth.types';

/**
 * A route wrapper that protects content based on authentication and role requirements
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The protected route content
 * @param {string[]} [props.requiredRoles] - Optional array of roles required to access the route
 * 
 * @example
 * ```tsx
 * // Basic authentication protection
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * 
 * // Role-based protection
 * <ProtectedRoute requiredRoles={['admin']}>
 *   <AdminPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const { roles, isLoading: isRolesLoading } = useUserRoles(user?.id);

  // Show loading state while checking auth
  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  // Not authenticated - redirect to login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If roles are required but still loading, show loading state
  if (requiredRoles && isRolesLoading) {
    return <div>Loading...</div>;
  }

  // Check role-based access if roles are specified
  if (requiredRoles && roles) {
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />;
    }
  }

  // User is authenticated and has required roles (or no roles required)
  return <>{children}</>;
} 