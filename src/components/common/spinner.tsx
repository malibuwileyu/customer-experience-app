/**
 * @fileoverview Spinner component for loading states
 * @module components/common/spinner
 * @description
 * An accessible spinner component for indicating loading states.
 * Supports multiple sizes and visual variants with smooth animations
 * and proper ARIA attributes for accessibility.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Props interface for the Spinner component
 * 
 * @interface
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 * @property {"sm" | "default" | "lg"} [size="default"] - Size of the spinner
 * @property {"default" | "secondary"} [variant="default"] - Visual style variant
 */
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "secondary"
}

/**
 * Spinner component for indicating loading states
 * 
 * Features:
 * - Multiple size options (sm, default, lg)
 * - Visual variants (default, secondary)
 * - Smooth animation
 * - Accessible with proper ARIA attributes
 * - Screen reader support
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <Spinner />
 * 
 * // Small secondary spinner
 * <Spinner
 *   size="sm"
 *   variant="secondary"
 * />
 * 
 * // Large spinner with custom class
 * <Spinner
 *   size="lg"
 *   className="text-primary"
 * />
 * ```
 */
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