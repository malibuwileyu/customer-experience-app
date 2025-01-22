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
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from './form'
import { useFormContext } from "react-hook-form"

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
 * @property {string} name - Name of the input for form context
 */
export interface FormInputProps extends Omit<InputProps, "className"> {
  wrapperClassName?: string
  label?: string
  error?: string
  description?: string
  required?: boolean
  name: string
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
  ({ wrapperClassName, label, error, description, required, name, ...props }, ref) => {
    const form = useFormContext()
    
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className={wrapperClassName}>
            {label && <FormLabel>{label}{required && ' *'}</FormLabel>}
            <FormControl>
              <Input
                {...field}
                {...props}
                ref={ref}
                aria-invalid={!!fieldState.error}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
          </FormItem>
        )}
      />
    )
  }
)
FormInput.displayName = "FormInput"

export { FormInput } 