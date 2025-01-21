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
 * @property {Object} actions - UI state actions
 * @property {Function} actions.toggleTheme - Toggles between light and dark themes
 * @property {Function} actions.toggleSidebar - Toggles sidebar visibility
 * @property {Function} actions.setSidebarOpen - Sets sidebar visibility directly
 */
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  actions: {
    toggleTheme: () => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
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
  /** UI state actions */
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
  },
}))
