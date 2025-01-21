/**
 * @fileoverview Form input component with label and error handling
 * @module components/common/form-input
 * @description
 * A higher-level input component that combines the base Input component
 * with form field features like labels, error messages, and descriptions.
 * Built for easy integration with form libraries and validation systems.
 */

import * as React from "react"
import { Input, type InputProps } from "./input"
import { FormField, type FormFieldProps } from "./form-field"

/**
 * Props interface for the FormInput component
 * 
 * @interface
 * @extends {Omit<InputProps, "className">}
 * @property {string} [wrapperClassName] - Class name for the form field wrapper
 * @property {string} [label] - Label text for the input
 * @property {string} [error] - Error message to display
 * @property {string} [description] - Helper text to display below the input
 * @property {boolean} [required] - Whether the input is required
 */
export interface FormInputProps extends Omit<InputProps, "className"> {
  wrapperClassName?: string
  label?: string
  error?: string
  description?: string
  required?: boolean
}

/**
 * Form input component with integrated label and error handling
 * 
 * Features:
 * - Integrated label support
 * - Error message display
 * - Helper text/description
 * - Required field indication
 * - Accessible error states
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <FormInput
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 * 
 * // With error and description
 * <FormInput
 *   label="Username"
 *   error="Username is already taken"
 *   description="Choose a unique username"
 *   required
 * />
 * 
 * // With custom wrapper styling
 * <FormInput
 *   label="Password"
 *   type="password"
 *   wrapperClassName="mt-4"
 * />
 * ```
 */
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ wrapperClassName, label, error, description, required, ...props }, ref) => {
    return (
      <FormField
        className={wrapperClassName}
        label={label}
        error={error}
        description={description}
        required={required}
      >
        <Input
          ref={ref}
          aria-invalid={!!error}
          {...props}
        />
      </FormField>
    )
  }
)
FormInput.displayName = "FormInput"

export { FormInput } 