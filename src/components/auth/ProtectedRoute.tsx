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
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { roles, isLoading: isLoadingRoles } = useUserRoles();

  console.log('ProtectedRoute:', {
    path: location.pathname,
    user: user?.id,
    requiredRoles,
    userRoles: roles,
    isLoading,
    isLoadingRoles
  });

  if (isLoading || isLoadingRoles) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !requiredRoles.some(role => roles.includes(role))) {
    console.log('ProtectedRoute: User lacks required roles:', {
      required: requiredRoles,
      userRoles: roles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
} 