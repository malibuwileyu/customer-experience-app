import * as React from "react"
import { cn } from "../../lib/utils"
import { FormField, type FormFieldProps } from "./form-field"

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  wrapperClassName?: string
  label?: string
  error?: string
  description?: string
  required?: boolean
}

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