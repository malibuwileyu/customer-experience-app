/**
 * @fileoverview Form select component with label and error handling
 * @module components/common/form-select
 * @description
 * A higher-level select component that combines the native select element
 * with form field features like labels, error messages, and descriptions.
 * Built for easy integration with form libraries and validation systems.
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { FormField, type FormFieldProps } from "./form-field"

/**
 * Props interface for the FormSelect component
 * 
 * @interface
 * @extends {React.SelectHTMLAttributes<HTMLSelectElement>}
 * @property {string} [wrapperClassName] - Class name for the form field wrapper
 * @property {string} [label] - Label text for the select
 * @property {string} [error] - Error message to display
 * @property {string} [description] - Helper text to display below the select
 * @property {boolean} [required] - Whether the select is required
 * @property {Array<{label: string, value: string | number, disabled?: boolean}>} options - 
 *   Array of options to display in the select
 */
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string
  label?: string
  error?: string
  description?: string
  required?: boolean
  options: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>
}

/**
 * Form select component with integrated label and error handling
 * 
 * Features:
 * - Integrated label support
 * - Error message display
 * - Helper text/description
 * - Required field indication
 * - Accessible error states
 * - Option disabling support
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <FormSelect
 *   label="Country"
 *   options={[
 *     { label: "United States", value: "us" },
 *     { label: "Canada", value: "ca" },
 *     { label: "Mexico", value: "mx" }
 *   ]}
 * />
 * 
 * // With error and description
 * <FormSelect
 *   label="Role"
 *   error="Please select a role"
 *   description="Choose your primary role"
 *   required
 *   options={[
 *     { label: "Admin", value: "admin" },
 *     { label: "User", value: "user", disabled: true }
 *   ]}
 * />
 * 
 * // With custom wrapper styling
 * <FormSelect
 *   label="Category"
 *   wrapperClassName="mt-4"
 *   options={[
 *     { label: "Option 1", value: 1 },
 *     { label: "Option 2", value: 2 }
 *   ]}
 * />
 * ```
 */
const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ 
    wrapperClassName, 
    className,
    label, 
    error, 
    description, 
    required,
    options,
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
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    )
  }
)
FormSelect.displayName = "FormSelect"

export { FormSelect } 