/**
 * @fileoverview Loading overlay component for content loading states
 * @module components/common/loading-overlay
 * @description
 * A flexible loading overlay component that displays a spinner over content
 * while loading. Supports blur effects, different spinner sizes and variants,
 * and can be used with or without child content.
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Spinner } from "./spinner"

/**
 * Props interface for the LoadingOverlay component
 * 
 * @interface
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 * @property {boolean} [isLoading=true] - Whether the loading state is active
 * @property {boolean} [blur=true] - Whether to apply blur effect to children
 * @property {"sm" | "default" | "lg"} [spinnerSize="default"] - Size of the spinner
 * @property {"default" | "secondary"} [spinnerVariant="default"] - Visual variant of the spinner
 * @property {React.ReactNode} [children] - Content to display behind the overlay
 */
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  blur?: boolean
  spinnerSize?: "sm" | "default" | "lg"
  spinnerVariant?: "default" | "secondary"
  children?: React.ReactNode
}

/**
 * Loading overlay component with spinner and blur effects
 * 
 * Features:
 * - Configurable spinner size and variant
 * - Optional blur effect on content
 * - Smooth transitions
 * - Semi-transparent background
 * - Centered spinner positioning
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <LoadingOverlay>
 *   <Content />
 * </LoadingOverlay>
 * 
 * // With custom spinner and no blur
 * <LoadingOverlay
 *   spinnerSize="lg"
 *   spinnerVariant="secondary"
 *   blur={false}
 * >
 *   <Content />
 * </LoadingOverlay>
 * 
 * // Controlled loading state
 * <LoadingOverlay
 *   isLoading={isLoading}
 *   className="min-h-[200px]"
 * >
 *   <Content />
 * </LoadingOverlay>
 * ```
 */
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