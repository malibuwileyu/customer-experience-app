import * as React from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Button } from "../components/common/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/common/card"
import { BuggyCounter } from "../components/common/buggy-counter"
import { ErrorFallback } from "../components/common/error-fallback"
import { useToast } from "../hooks/use-toast"

export default function DashboardPage() {
  const { toast } = useToast()
  const [showError, setShowError] = React.useState(false)

  const handleError = React.useCallback((error: Error) => {
    toast.error("An error occurred in the demo component", {
      description: error.message,
    })
  }, [toast])

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