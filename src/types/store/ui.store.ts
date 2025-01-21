/**
 * @fileoverview UI store type definitions
 * @module types/store/ui
 * @description
 * Type definitions for the UI store using Zustand.
 * Includes state and actions for managing UI state.
 */

/**
 * Theme mode options
 * 
 * @type {ThemeMode}
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Toast notification type
 * 
 * @type {ToastType}
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 * 
 * @interface Toast
 * @property {string} id - Unique identifier
 * @property {string} message - Toast message
 * @property {ToastType} type - Toast type
 * @property {number} duration - Duration in milliseconds
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

/**
 * UI store state
 * 
 * @interface UIState
 * @property {ThemeMode} theme - Current theme mode
 * @property {boolean} sidebarOpen - Sidebar open state
 * @property {Toast[]} toasts - Active toast notifications
 * @property {boolean} loading - Global loading state
 * @property {string | null} error - Global error message
 */
export interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  toasts: Toast[];
  loading: boolean;
  error: string | null;
}

/**
 * UI store actions
 * 
 * @interface UIActions
 * @property {Function} setTheme - Set the theme mode
 * @property {Function} toggleSidebar - Toggle sidebar state
 * @property {Function} addToast - Add a new toast notification
 * @property {Function} removeToast - Remove a toast notification
 * @property {Function} setLoading - Set the loading state
 * @property {Function} setError - Set the error message
 * @property {Function} reset - Reset the store to initial state
 */
export interface UIActions {
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Complete UI store type
 * Combines state and actions
 * 
 * @type {UIStore}
 */
export type UIStore = UIState & UIActions; 