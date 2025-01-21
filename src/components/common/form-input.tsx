import * as React from "react"
import { Input, type InputProps } from "./input"
import { FormField, type FormFieldProps } from "./form-field"

export interface FormInputProps extends Omit<InputProps, "className"> {
  wrapperClassName?: string
  label?: string
  error?: string
  description?: string
  required?: boolean
}

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