/**
 * @fileoverview Form textarea component with label and error handling
 * @module components/common/form-textarea
 * @description
 * A higher-level textarea component that combines the native textarea element
 * with form field features like labels, error messages, and descriptions.
 * Built for easy integration with form libraries and validation systems.
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { FormField, type FormFieldProps } from "./form-field"

/**
 * Props interface for the FormTextarea component
 * 
 * @interface
 * @extends {React.TextareaHTMLAttributes<HTMLTextAreaElement>}
 * @property {string} [wrapperClassName] - Class name for the form field wrapper
 * @property {string} [label] - Label text for the textarea
 * @property {string} [error] - Error message to display
 * @property {string} [description] - Helper text to display below the textarea
 * @property {boolean} [required] - Whether the textarea is required
 */
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  wrapperClassName?: string
  label?: string
  error?: string
  description?: string
  required?: boolean
}

/**
 * Form textarea component with integrated label and error handling
 * 
 * Features:
 * - Integrated label support
 * - Error message display
 * - Helper text/description
 * - Required field indication
 * - Accessible error states
 * - Resizable text area
 * - Minimum height setting
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <FormTextarea
 *   label="Comments"
 *   placeholder="Enter your comments"
 * />
 * 
 * // With error and description
 * <FormTextarea
 *   label="Feedback"
 *   error="Feedback is too short"
 *   description="Please provide detailed feedback"
 *   required
 *   minLength={50}
 * />
 * 
 * // With custom wrapper styling and rows
 * <FormTextarea
 *   label="Description"
 *   wrapperClassName="mt-4"
 *   rows={6}
 *   placeholder="Enter a detailed description"
 * />
 * ```
 */
const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ 
    wrapperClassName, 
    className,
    label, 
    error, 
    description, 
    required,
    ...props 
  }, ref) => {
    return (
      <FormField
        className={wrapperClassName}
        label={label}
        error={error}
        description={description}
        required={required}
      >
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      </FormField>
    )
  }
)
FormTextarea.displayName = "FormTextarea"

export { FormTextarea } 