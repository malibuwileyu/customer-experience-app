import * as React from "react"
import { cn } from "../../lib/utils"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  description?: string
  required?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, children, label, error, description, required, ...props }, ref) => {
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