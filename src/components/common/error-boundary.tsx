import * as React from "react"
import { ErrorFallback } from "./error-fallback"

interface ErrorBoundaryState {
  error: Error | null
  hasError: boolean
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  description?: string
  onReset?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.log('ErrorBoundary: getDerivedStateFromError called with:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary: Error caught:", error)
    console.error("ErrorBoundary: Component stack:", errorInfo.componentStack)
    this.props.onError?.(error, errorInfo)
  }

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