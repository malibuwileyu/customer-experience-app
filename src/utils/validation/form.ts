/**
 * @fileoverview Form validation utilities
 * @module utils/validation/form
 * @description
 * Provides utilities for form validation and error handling
 * using React Hook Form and Zod schemas.
 */
import { FieldValues, Path, UseFormReturn, FieldError } from 'react-hook-form';
import { ZodError } from 'zod';

/**
 * Gets the first error message from a field's error object
 * 
 * @function getFieldError
 * @template T - Form values type
 * @param {UseFormReturn<T>} form - React Hook Form instance
 * @param {Path<T>} field - Field path
 * @returns {string | undefined} Error message if any
 * 
 * @example
 * ```tsx
 * const error = getFieldError(form, 'email');
 * // 'Email is required'
 * ```
 */
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: Path<T>
): string | undefined {
  const error = form.formState.errors[field] as FieldError | undefined;
  return error?.message;
}

/**
 * Checks if a field has any errors
 * 
 * @function hasFieldError
 * @template T - Form values type
 * @param {UseFormReturn<T>} form - React Hook Form instance
 * @param {Path<T>} field - Field path
 * @returns {boolean} Whether the field has errors
 * 
 * @example
 * ```tsx
 * const hasError = hasFieldError(form, 'email');
 * // true
 * ```
 */
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: Path<T>
): boolean {
  return !!form.formState.errors[field];
}

/**
 * Gets all error messages from a Zod validation error
 * 
 * @function getZodErrors
 * @param {ZodError} error - Zod validation error
 * @returns {Record<string, string>} Field errors mapped to messages
 * 
 * @example
 * ```typescript
 * const errors = getZodErrors(error);
 * // { email: 'Invalid email', password: 'Too short' }
 * ```
 */
export function getZodErrors(error: ZodError): Record<string, string> {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join('.');
    acc[path] = err.message;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Gets validation state classes for a field
 * 
 * @function getFieldStateClass
 * @template T - Form values type
 * @param {UseFormReturn<T>} form - React Hook Form instance
 * @param {Path<T>} field - Field path
 * @returns {string} Tailwind CSS classes for the field state
 * 
 * @example
 * ```tsx
 * const className = getFieldStateClass(form, 'email');
 * // 'border-red-500 focus:ring-red-500'
 * ```
 */
export function getFieldStateClass<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: Path<T>
): string {
  const hasError = hasFieldError(form, field);
  const isDirty = field in form.formState.dirtyFields;
  const isValid = !hasError && isDirty;

  if (hasError) {
    return 'border-red-500 focus:ring-red-500';
  }
  if (isValid) {
    return 'border-green-500 focus:ring-green-500';
  }
  return '';
}

/**
 * Gets ARIA attributes for a field based on its state
 * 
 * @function getFieldAriaProps
 * @template T - Form values type
 * @param {UseFormReturn<T>} form - React Hook Form instance
 * @param {Path<T>} field - Field path
 * @returns {Object} ARIA attributes object
 * 
 * @example
 * ```tsx
 * const attrs = getFieldAriaProps(form, 'email');
 * // { 'aria-invalid': true, 'aria-errormessage': 'email-error' }
 * ```
 */
export function getFieldAriaProps<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: Path<T>
): { 'aria-invalid': boolean; 'aria-errormessage'?: string } {
  const error = getFieldError(form, field);
  const errorId = error ? `${field}-error` : undefined;
  
  return {
    'aria-invalid': !!error,
    'aria-errormessage': errorId
  };
}

/**
 * Gets common props for a form field
 * 
 * @function getFieldProps
 * @template T - Form values type
 * @param {UseFormReturn<T>} form - React Hook Form instance
 * @param {Path<T>} field - Field path
 * @returns {Object} Common field props
 * 
 * @example
 * ```tsx
 * const props = getFieldProps(form, 'email');
 * // {
 * //   id: 'email',
 * //   name: 'email',
 * //   className: 'border-red-500 focus:ring-red-500',
 * //   'aria-invalid': true,
 * //   'aria-errormessage': 'email-error'
 * // }
 * ```
 */
export function getFieldProps<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: Path<T>
): Record<string, unknown> {
  return {
    id: field,
    name: field,
    className: getFieldStateClass(form, field),
    ...getFieldAriaProps(form, field),
  };
} 