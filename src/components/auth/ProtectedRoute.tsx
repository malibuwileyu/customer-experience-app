import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ProtectedRouteProps } from '../../types/auth.types';

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (requiredRoles) {
    // TODO: Implement role checking when we add role management
    // For now, just render children since we're authenticated
    return <>{children}</>;
  }

  return <>{children}</>;
} 