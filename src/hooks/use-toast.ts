/**
 * @fileoverview Toast notification hook using Sonner
 * @module hooks/use-toast
 * @description
 * A custom hook that provides a simplified interface for displaying toast notifications
 * using the Sonner toast library. Supports success, error, warning, info, and loading
 * notifications with customizable options.
 */

import { toast } from "sonner"

/**
 * Type alias for Sonner toast options
 * Extracts the options parameter type from the toast function
 */
type ToastOptions = Parameters<typeof toast>[1]

/**
 * Hook for displaying toast notifications
 * 
 * Features:
 * - Multiple toast types (success, error, warning, info, loading)
 * - Customizable options for each toast
 * - Ability to dismiss toasts programmatically
 * - Type-safe toast options
 * 
 * @returns {Object} Toast notification methods
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { success, error } = useToast()
 * 
 *   const handleSuccess = () => {
 *     success('Operation completed successfully')
 *   }
 * 
 *   const handleError = () => {
 *     error('Something went wrong', { duration: 5000 })
 *   }
 * 
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Success</button>
 *       <button onClick={handleError}>Error</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useToast() {
  return {
    /** Base toast function for custom notifications */
    toast,

    /** Display a success toast notification */
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, {
        ...options,
      })
    },

    /** Display an error toast notification */
    error: (message: string, options?: ToastOptions) => {
      toast.error(message, {
        ...options,
      })
    },

    /** Display a warning toast notification */
    warning: (message: string, options?: ToastOptions) => {
      toast.warning(message, {
        ...options,
      })
    },

    /** Display an info toast notification */
    info: (message: string, options?: ToastOptions) => {
      toast.info(message, {
        ...options,
      })
    },

    /** Display a loading toast notification */
    loading: (message: string, options?: ToastOptions) => {
      toast.loading(message, {
        ...options,
      })
    },

    /** Dismiss a specific toast or all toasts */
    dismiss: (toastId?: string) => {
      toast.dismiss(toastId)
    },
  }
} 