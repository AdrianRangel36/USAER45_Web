import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, getApiErrorMessage } from '@/lib/api'
import type { LoginResponse, Role, User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      async login(email, password) {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
          })
          set({ token: data.token, user: data.user, loading: false })
        } catch (error) {
          set({
            token: null,
            user: null,
            loading: false,
            error: getApiErrorMessage(error),
          })
          throw error
        }
      },

      logout() {
        set({ token: null, user: null, error: null })
      },

      hasRole(...roles) {
        const role = get().user?.role
        return role !== undefined && roles.includes(role)
      },
    }),
    {
      name: 'usaer45-auth',
      // Solo se persiste la sesión; loading/error son estado efímero.
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
