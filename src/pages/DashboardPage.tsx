/**
 * @fileoverview Dashboard page component
 * @module pages/DashboardPage
 * @description
 * Main dashboard page that demonstrates error boundary functionality and
 * provides a demo of error handling capabilities. Includes interactive
 * examples of error states and recovery mechanisms.
 */

import * as React from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Button } from "../components/common/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/common/card"
import { BuggyCounter } from "../components/common/buggy-counter"
import { ErrorFallback } from "../components/common/error-fallback"
import { useToast } from "../hooks/use-toast"

/**
 * Dashboard page component with error handling demonstrations
 * 
 * Features:
 * - Interactive error boundary demo
 * - Toast notifications for error states
 * - Error recovery mechanisms
 * - Component state management
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route 
 *   path="/app/dashboard" 
 *   element={
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   } 
 * />
 * ```
 */
export default function DashboardPage() {
  const { toast } = useToast()
  const [showError, setShowError] = React.useState(false)

  /**
   * Handles errors thrown by the demo component
   * Displays a toast notification with error details
   * 
   * @param {Error} error - The error that was thrown
   */
  const handleError = React.useCallback((error: Error) => {
    toast.error("An error occurred in the demo component", {
      description: error.message,
    })
  }, [toast])

  /**
   * Resets the error boundary and shows a success toast
   * Called when the user clicks the "Try Again" button
   */
  const handleReset = React.useCallback(() => {
    toast.success("Error boundary was reset", {
      description: "The component has been reset to its initial state",
    })
    setShowError(false)
  }, [toast])

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Demo</CardTitle>
          <CardDescription>
            This demonstrates how error boundaries catch and handle React errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant={showError ? "destructive" : "outline"}
              onClick={() => setShowError(!showError)}
            >
              {showError ? "Hide Error Demo" : "Show Error Demo"}
            </Button>

            {showError && (
              <div className="mt-4">
                <ErrorBoundary
                  FallbackComponent={ErrorFallback}
                  onError={handleError}
                  onReset={handleReset}
                >
                  <BuggyCounter />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 