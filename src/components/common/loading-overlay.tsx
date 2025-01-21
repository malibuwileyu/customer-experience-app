import * as React from "react"
import { cn } from "../../lib/utils"
import { Spinner } from "./spinner"

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  blur?: boolean
  spinnerSize?: "sm" | "default" | "lg"
  spinnerVariant?: "default" | "secondary"
  children?: React.ReactNode
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className, 
    isLoading = true, 
    blur = true,
    spinnerSize = "default",
    spinnerVariant = "default",
    children,
    ...props 
  }, ref) => {
    if (!isLoading) return <>{children}</>

    return (
      <div ref={ref} className="relative" {...props}>
        {children && (
          <div className={cn(
            "transition-all duration-200",
            blur && "blur-sm"
          )}>
            {children}
          </div>
        )}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/50",
            className
          )}
        >
          <Spinner size={spinnerSize} variant={spinnerVariant} />
        </div>
      </div>
    )
  }
)
LoadingOverlay.displayName = "LoadingOverlay"

export { LoadingOverlay } 