/**
 * @fileoverview Skeleton loading component for content placeholders
 * @module components/common/skeleton
 * @description
 * A flexible skeleton component for displaying loading states and placeholders.
 * Provides multiple variants for different content types with consistent
 * styling and animations.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Props interface for the Skeleton component
 * 
 * @interface
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 * @property {"default" | "card" | "title" | "text"} [variant="default"] - Visual style variant
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "title" | "text"
}

/**
 * Skeleton component for content loading states
 * 
 * Features:
 * - Multiple variants for different content types
 * - Smooth pulse animation
 * - Consistent styling with theme
 * - Customizable through className
 * 
 * Variants:
 * - default: Small block (8px height)
 * - text: Full width text line
 * - title: Larger text line (75% width)
 * - card: Card placeholder (120px height)
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <Skeleton />
 * 
 * // Text line placeholder
 * <Skeleton variant="text" />
 * 
 * // Title placeholder
 * <Skeleton variant="title" />
 * 
 * // Card placeholder
 * <Skeleton variant="card" />
 * 
 * // Multiple text lines
 * <div className="space-y-2">
 *   <Skeleton variant="title" />
 *   <Skeleton variant="text" />
 *   <Skeleton variant="text" />
 * </div>
 * ```
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-muted",
          {
            "h-4 w-full": variant === "text",
            "h-6 w-3/4": variant === "title",
            "h-[120px] w-full": variant === "card",
            "h-4 w-8": variant === "default",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton } 