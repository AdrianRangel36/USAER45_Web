import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type { CreateSessionInput, Session } from '@/types'

// Sigue el contrato del módulo /sessions de USAER45_Back: el docente solo ve
// sus propias sesiones (filtrado por el backend); teacherId siempre se toma
// del JWT en el servidor, nunca se envía desde aquí. No hay update/delete.

interface SessionState {
  sessions: Session[]
  selected: Session | null
  loading: boolean
  error: string | null
  fetchSessions: () => Promise<void>
  fetchSession: (id: string) => Promise<void>
  createSession: (input: CreateSessionInput) => Promise<Session>
  clearSelected: () => void
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  sessions: [],
  selected: null,
  loading: false,
  error: null,

  async fetchSessions() {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<Session[]>('/sessions')
      set({ sessions: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },

  async fetchSession(id) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<Session>(`/sessions/${id}`)
      set({ selected: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },

  async createSession(input) {
    const { data } = await api.post<Session>('/sessions', input)
    set({ sessions: [...get().sessions, data] })
    return data
  },

  clearSelected() {
    set({ selected: null })
  },
}))
