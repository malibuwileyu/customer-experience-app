import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegistrationPage } from './pages/auth/RegistrationPage';
import { LandingPage } from './pages/LandingPage';
import { ToastProvider } from './components/common/toast-provider';
import { useAuth, AuthProvider } from './contexts/AuthContext';

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Auth callback handler
function AuthCallback() {
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (user) {
      window.location.href = '/app/dashboard';
    }
  }, [user]);
  
  return <div>Processing authentication...</div>;
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Redirect old dashboard route */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          
          {/* Protected routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {/* Add more routes here as we build them */}
          </Route>
        </Routes>
      </Router>
      <ToastProvider />
    </AuthProvider>
  );
} 