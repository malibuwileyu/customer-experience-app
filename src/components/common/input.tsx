/**
 * @fileoverview Base input component with consistent styling
 * @module components/common/input
 * @description
 * A styled input component that provides consistent theming and behavior.
 * Built on the native input element with added styling, transitions,
 * and accessibility features.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Props interface for the Input component
 * 
 * @interface
 * @extends {React.InputHTMLAttributes<HTMLInputElement>}
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Base input component with consistent styling
 * 
 * Features:
 * - Consistent theme-aware styling
 * - Focus and hover states
 * - File input support
 * - Disabled state handling
 * - Placeholder styling
 * - Shadow and border effects
 * 
 * @component
 * @example
 * ```tsx
 * // Basic text input
 * <Input type="text" placeholder="Enter text" />
 * 
 * // Email input with custom class
 * <Input
 *   type="email"
 *   placeholder="Enter email"
 *   className="max-w-sm"
 * />
 * 
 * // Disabled input
 * <Input
 *   type="text"
 *   disabled
 *   value="Disabled input"
 * />
 * 
 * // File input
 * <Input
 *   type="file"
 *   accept="image/*"
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 