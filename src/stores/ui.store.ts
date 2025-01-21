import { create } from 'zustand'

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  actions: {
    toggleTheme: () => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
  }
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  actions: {
    toggleTheme: () =>
      set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
    toggleSidebar: () =>
      set((state) => ({
        sidebarOpen: !state.sidebarOpen,
      })),
    setSidebarOpen: (open: boolean) =>
      set(() => ({
        sidebarOpen: open,
      })),
  },
}))
