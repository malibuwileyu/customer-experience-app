import { toast } from "sonner"

type ToastOptions = Parameters<typeof toast>[1]

export function useToast() {
  return {
    toast,
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, {
        ...options,
      })
    },
    error: (message: string, options?: ToastOptions) => {
      toast.error(message, {
        ...options,
      })
    },
    warning: (message: string, options?: ToastOptions) => {
      toast.warning(message, {
        ...options,
      })
    },
    info: (message: string, options?: ToastOptions) => {
      toast.info(message, {
        ...options,
      })
    },
    loading: (message: string, options?: ToastOptions) => {
      toast.loading(message, {
        ...options,
      })
    },
    dismiss: (toastId?: string) => {
      toast.dismiss(toastId)
    },
  }
} 