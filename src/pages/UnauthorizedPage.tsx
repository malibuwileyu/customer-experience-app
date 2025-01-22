/**
 * @fileoverview Unauthorized access page component
 * @module pages/UnauthorizedPage
 * @description
 * Displays an access denied message when users attempt to access restricted content.
 * Provides navigation options to return to a safe location based on user's auth state.
 */

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/common/button"

/**
 * Unauthorized page component that handles access denied scenarios
 * 
 * Features:
 * - Displays access denied message
 * - Smart navigation based on auth state
 * - Preserves attempted access location
 * - Provides multiple navigation options
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="/unauthorized" element={<UnauthorizedPage />} />
 * 
 * // In your protected route component
 * navigate('/unauthorized', { 
 * });
 * ```
 */
export function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  /**
   * Handles navigation to the appropriate home page based on auth state
   * Authenticated users go to dashboard, others to landing page
   */
  const handleHomeClick = () => {
    navigate(user ? '/app/dashboard' : '/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter">Access Denied</h1>
        <p className="text-lg text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleHomeClick}>
            Go to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 