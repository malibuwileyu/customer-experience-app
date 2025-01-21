/**
 * @fileoverview Form field wrapper component with label and error handling
 * @module components/common/form-field
 * @description
 * A wrapper component that provides consistent layout and styling for form fields.
 * Handles labels, error messages, descriptions, and required field indicators.
 * Automatically manages accessibility attributes and IDs.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Props interface for the FormField component
 * 
 * @interface
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 * @property {string} [label] - Label text for the form field
 * @property {string} [error] - Error message to display
 * @property {string} [description] - Helper text to display below the field
 * @property {boolean} [required] - Whether the field is required
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  description?: string
  required?: boolean
}

/**
 * Form field wrapper component with integrated label and error handling
 * 
 * Features:
 * - Automatic ID generation
 * - Label support with required indicator
 * - Error message display
 * - Helper text/description
 * - Proper ARIA attributes
 * - Consistent spacing and layout
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage with input
 * <FormField
 *   label="Username"
 *   description="Choose a unique username"
 * >
 *   <Input placeholder="Enter username" />
 * </FormField>
 * 
 * // With error state
 * <FormField
 *   label="Email"
 *   error="Please enter a valid email"
 *   required
 * >
 *   <Input type="email" />
 * </FormField>
 * 
 * // With custom styling
 * <FormField
 *   label="Bio"
 *   description="Tell us about yourself"
 *   className="max-w-sm"
 * >
 *   <Textarea />
 * </FormField>
 * ```
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, children, label, error, description, required, ...props }, ref) => {
    // Generate unique ID for field components
    const id = React.useId()

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id,
              "aria-describedby": description ? `${id}-description` : undefined,
              ...child.props
            })
          }
          return child
        })}
        {description && (
          <p
            id={`${id}-description`}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField } 