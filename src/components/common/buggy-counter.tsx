/**
 * @fileoverview Buggy counter component for error boundary demonstration
 * @module components/common/buggy-counter
 * @description
 * A deliberately buggy counter component that throws an error when reaching
 * a specific value. Used to demonstrate error boundary functionality and
 * error handling in React components.
 */

import * as React from "react"
import { Button } from "./button"
import { useToast } from "../../hooks/use-toast"

/**
 * A counter component that intentionally throws an error
 * 
 * Features:
 * - Increments a counter on button click
 * - Shows warning toast before error
 * - Throws error at count = 5
 * - Includes debug logging
 * 
 * This component is designed to demonstrate:
 * 1. Error boundary functionality
 * 2. Toast notifications
 * 3. Component state management
 * 4. Error handling patterns
 * 
 * @component
 * @example
 * ```tsx
 * // Wrap in error boundary for proper error handling
 * <ErrorBoundary
 *   fallback={<ErrorFallback />}
 *   onReset={() => window.location.reload()}
 * >
 *   <BuggyCounter />
 * </ErrorBoundary>
 * ```
 */
export function BuggyCounter() {
  const { toast } = useToast()
  const [count, setCount] = React.useState(0)

  /**
   * Handles counter increment and error triggering
   * Shows warning toast at count 4 and throws error at count 5
   */
  const handleIncrement = () => {
    const newCount = count + 1
    
    if (newCount === 5) {
      toast.warning("Counter is about to throw an error!", {
        description: "This demonstrates how error boundaries catch and handle React errors",
        duration: 2000,
      })
      
      // Use setTimeout to allow the toast to be shown before throwing the error
      setTimeout(() => {
        throw new Error("Counter reached 5! This is a demo error.")
      }, 2000)
      return
    }
    
    setCount(newCount)
  }

  // Debug logging for component state changes
  React.useEffect(() => {
    console.log('BuggyCounter rendered with count:', count)
  }, [count])

  return (
    <div className="space-y-4">
      <p className="text-lg">
        Current count: <span className="font-bold">{count}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        This counter will throw an error when it reaches 5
      </p>
      <Button onClick={handleIncrement}>
        Increment Counter
      </Button>
    </div>
  )
} 