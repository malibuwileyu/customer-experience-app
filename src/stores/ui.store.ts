/**
 * @fileoverview UI state management store
 * @module stores/ui
 * @description
 * Manages global UI state using Zustand, including theme preferences and
 * sidebar visibility. Provides actions for updating UI state throughout
 * the application.
 */

import { create } from 'zustand'

/**
 * UI state interface defining theme and sidebar state
 * 
 * @interface
 * @property {('light' | 'dark')} theme - Current theme setting
 * @property {boolean} sidebarOpen - Whether the sidebar is open
 * @property {boolean} isLoading - Whether the application is loading
 * @property {Object} actions - UI state actions
 * @property {Function} actions.toggleTheme - Toggles between light and dark themes
 * @property {Function} actions.toggleSidebar - Toggles sidebar visibility
 * @property {Function} actions.setSidebarOpen - Sets sidebar visibility directly
 */
export interface Toast {
  id: string
  title: string
  description?: string
  type?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
}

export interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  isLoading: boolean
  toasts: Toast[]
  actions: {
    toggleTheme: () => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    toast: (toast: Omit<Toast, 'id'>) => void
    dismissToast: (id: string) => void
  }
}

/**
 * UI store hook using Zustand
 * 
 * Features:
 * - Theme management (light/dark)
 * - Sidebar visibility control
 * - Persistent state between renders
 * - Type-safe actions
 * 
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, actions } = useUIStore();
 *   
 *   return (
 *     <button onClick={actions.toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * 
 * function SidebarControl() {
 *   const { sidebarOpen, actions } = useUIStore();
 *   
 *   return (
 *     <button onClick={actions.toggleSidebar}>
 *       {sidebarOpen ? 'Close' : 'Open'} Sidebar
 *     </button>
 *   );
 * }
 * ```
 */
export const useUIStore = create<UIState>((set) => ({
  /** Default theme is light */
  theme: 'light',
  /** Sidebar starts open */
  sidebarOpen: true,
  /** Default loading state */
  isLoading: false,
  /** UI state actions */
  toasts: [],
  actions: {
    /** Toggles between light and dark themes */
    toggleTheme: () =>
      set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
    /** Toggles sidebar visibility */
    toggleSidebar: () =>
      set((state) => ({
        sidebarOpen: !state.sidebarOpen,
      })),
    /** Sets sidebar visibility to a specific state */
    setSidebarOpen: (open: boolean) =>
      set(() => ({
        sidebarOpen: open,
      })),
    toast: (toast) => set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }]
    })),
    dismissToast: (id) => set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },
}))

export default useUIStore
