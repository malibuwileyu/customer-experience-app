import * as React from "react"
import { cn } from "../../lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "secondary"
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn(
          "inline-block animate-spin rounded-full border-2",
          {
            "h-4 w-4 border-2": size === "sm",
            "h-6 w-6 border-2": size === "default",
            "h-8 w-8 border-3": size === "lg",
            "border-primary border-t-transparent": variant === "default",
            "border-secondary border-t-transparent": variant === "secondary",
          },
          className
        )}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner } 