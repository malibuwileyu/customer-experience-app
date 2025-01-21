import * as React from "react"
import { cn } from "../../lib/utils"
import { FormField, type FormFieldProps } from "./form-field"

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