/**
 * @fileoverview Landing page component
 * @module pages/LandingPage
 * @description
 * Main landing page for unauthenticated users. Provides a welcoming introduction
 * to the application and navigation options for authentication.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/button';

/**
 * Landing page component for the application
 * 
 * Features:
 * - Welcoming hero section
 * - Application description
 * - Authentication navigation options
 * - Responsive design
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="/" element={<LandingPage />} />
 * 
 * // With authentication guard
 * function PublicRoute() {
 *   return !isAuthenticated ? <LandingPage /> : <Navigate to="/app" />;
 * }
 * ```
 */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl space-y-8 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Customer Experience App
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          A modern solution for managing customer support and experience
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 