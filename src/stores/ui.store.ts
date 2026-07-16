import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface UiState {
  sidebarOpen: boolean
  theme: Theme
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',

      toggleSidebar() {
        set({ sidebarOpen: !get().sidebarOpen })
      },

      setSidebarOpen(open) {
        set({ sidebarOpen: open })
      },

      setTheme(theme) {
        applyTheme(theme)
        set({ theme })
      },

      toggleTheme() {
        get().setTheme(get().theme === 'light' ? 'dark' : 'light')
      },
    }),
    {
      name: 'usaer45-ui',
      partialize: (state) => ({ theme: state.theme }),
      // Reaplica la clase .dark al <html> cuando se restaura la preferencia.
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
