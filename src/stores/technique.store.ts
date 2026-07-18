import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type { TeachingTechnique } from '@/types'

// GET /techniques: catálogo de sólo lectura (ADMIN, DOCENTE), sembrado por
// prisma/seed.ts en USAER45_Back. No hay endpoints de creación/edición.

interface TechniqueState {
  techniques: TeachingTechnique[]
  loading: boolean
  error: string | null
  fetchTechniques: () => Promise<void>
}

export const useTechniqueStore = create<TechniqueState>()((set) => ({
  techniques: [],
  loading: false,
  error: null,

  async fetchTechniques() {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<TeachingTechnique[]>('/techniques')
      set({ techniques: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },
}))
