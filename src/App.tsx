/**
 * @fileoverview Root application component handling routing and core providers
 * @module src/App
 * @description
 * This file serves as the main application component, setting up:
 * - React Query for data fetching
 * - Authentication provider and protected routes
 * - Role-based route protection
 * - Application-wide toast notifications
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TicketsPage } from './pages/tickets/TicketsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { RoleManagementPage } from './pages/admin/RoleManagementPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegistrationPage } from './pages/auth/RegistrationPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { LandingPage } from './pages/LandingPage';
import { ToastProvider } from './components/common/toast-provider';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserRoles } from './hooks/auth/useUserRoles';

// Create a client
const queryClient = new QueryClient();

/**
 * Handles authentication callback processing and redirection
 * 
 * @component
 * @example
 * ```tsx
 * <Route path="/auth/callback" element={<AuthCallback />} />
 * ```
 */
function AuthCallback() {
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (user) {
      window.location.href = '/app/dashboard';
    }
  }, [user]);
  
  return <div>Processing authentication...</div>;
}

/**
 * Handles routing logic for the home route based on authentication and user roles
 * 
 * @component
 * @example
 * ```tsx
 * <Route path="/" element={<HomeRoute />} />
 * ```
 */
function HomeRoute() {
  const { user } = useAuth();
  const { roles, isLoading } = useUserRoles(user?.id);

  // Show loading state while checking roles
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Not logged in - show landing page
  if (!user) {
    return <LandingPage />;
  }

  // Redirect based on role
  if (roles?.includes('admin')) {
    return <Navigate to="/app/admin/dashboard" replace />;
  }
  if (roles?.includes('agent')) {
    return <Navigate to="/app/tickets" replace />;
  }

  // Default to regular dashboard for customers
  return <Navigate to="/app/dashboard" replace />;
}

/**
 * Root application component that sets up the core providers and routing structure
 * 
 * Sets up the following providers:
 * - React Query for data fetching
 * - Authentication context
 * - Router for navigation
 * - Toast notifications
 * 
 * @component
 * @example
 * ```tsx
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <App />
 * )
 * ```
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Auth routes */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Role-protected routes */}
              <Route path="tickets" element={
                <ProtectedRoute requiredRoles={['admin', 'agent']}>
                  <TicketsPage />
                </ProtectedRoute>
              } />
              
              <Route path="admin">
                <Route path="dashboard" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="roles" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <RoleManagementPage />
                  </ProtectedRoute>
                } />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ToastProvider />
      </AuthProvider>
    </QueryClientProvider>
  );
} 