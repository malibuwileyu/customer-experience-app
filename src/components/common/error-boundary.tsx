/**
 * @fileoverview Error boundary component for graceful error handling
 * @module components/common/error-boundary
 * @description
 * A class component that catches JavaScript errors anywhere in its child component
 * tree and displays a fallback UI instead of the component tree that crashed.
 */

import * as React from "react"
import { ErrorFallback } from "./error-fallback"

/**
 * Internal state interface for the ErrorBoundary component
 * 
 * @interface
 * @property {Error | null} error - The error that was caught, if any
 * @property {boolean} hasError - Whether an error has been caught
 */
interface ErrorBoundaryState {
  error: Error | null
  hasError: boolean
}

/**
 * Props interface for the ErrorBoundary component
 * 
 * @interface
 * @property {React.ReactNode} children - Child components to be rendered
 * @property {string} [description] - Optional description of the error context
 * @property {() => void} [onReset] - Optional callback when error is reset
 * @property {(error: Error, errorInfo: React.ErrorInfo) => void} [onError] - Optional error handler
 */
interface ErrorBoundaryProps {
  children: React.ReactNode
  description?: string
  onReset?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * A component that catches JavaScript errors in its child component tree
 * 
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary
 *   description="Something went wrong in the dashboard"
 *   onError={(error) => logError(error)}
 *   onReset={() => resetState()}
 * >
 *   <DashboardContent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Static method to derive error state from caught errors
   * 
   * @param {Error} error - The error that was caught
   * @returns {ErrorBoundaryState} New state with error information
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.log('ErrorBoundary: getDerivedStateFromError called with:', error)
    return { hasError: true, error }
  }

  /**
   * Lifecycle method called after an error has been caught
   * 
   * @param {Error} error - The error that was caught
   * @param {React.ErrorInfo} errorInfo - Information about the error
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary: Error caught:", error)
    console.error("ErrorBoundary: Component stack:", errorInfo.componentStack)
    this.props.onError?.(error, errorInfo)
  }

  /**
   * Resets the error boundary to its initial state
   */
  resetErrorBoundary = () => {
    console.log('ErrorBoundary: Resetting error state')
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      console.log('ErrorBoundary: Rendering error fallback')
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          description={this.props.description}
        />
      )
    }

    return this.props.children
  }
} 