import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"
import { useToast } from "../../hooks/use-toast"

export interface ErrorFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  error: Error
  resetErrorBoundary: () => void
  description?: string
}

const ErrorFallback = React.forwardRef<HTMLDivElement, ErrorFallbackProps>(
  ({ className, error, resetErrorBoundary, description, ...props }, ref) => {
    const { toast } = useToast()

    React.useEffect(() => {
      toast.error("An error occurred", {
        description: error.message,
        duration: 5000,
      })
    }, [error, toast])

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center min-h-[200px] p-4", className)}
        {...props}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
            <CardDescription>{description || "An error occurred while rendering this component"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md overflow-auto">
              {error.message}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button
              onClick={resetErrorBoundary}
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
)
ErrorFallback.displayName = "ErrorFallback"

export { ErrorFallback } 