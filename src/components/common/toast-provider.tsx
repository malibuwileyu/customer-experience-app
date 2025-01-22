/**
 * @fileoverview Toast notification provider component
 * @module components/common/toast-provider
 * @description
 * A provider component that sets up the toast notification system using Sonner.
 * Configures global toast styling and positioning to match the application theme.
 */

import { Toaster as SonnerToaster } from "sonner"

/**
 * Toast provider component for application-wide notifications
 * 
 * Features:
 * - Top-right positioning
 * - Theme-aware styling
 * - Consistent border and colors
 * - Accessible notifications
 * 
 * @component
 * @example
 * ```tsx
 * // In your app root
 * function App() {
 *   return (
 *     <>
 *       <AppContent />
 *       <ToastProvider />
 *     </>
 *   )
 * }
 * 
 * // Using toast notifications
 * import { toast } from 'sonner'
 * 
 * // Show success toast
 * toast.success('Operation completed')
 * 
 * // Show error toast
 * toast.error('Something went wrong')
 * ```
 */
export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  )
} 