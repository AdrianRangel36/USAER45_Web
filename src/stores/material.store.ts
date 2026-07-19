import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type { ArasaacMaterial } from '@/types'

// UI-11: biblioteca de materiales didácticos ARASAAC.
// Consume el proxy propio del backend (GET /arasaac/materials/search?term=),
// que ya transforma la respuesta de ARASAAC y arma las URLs de miniatura y
// descarga. Mismo estilo que arasaac.store.ts (búsqueda de pictogramas).
//
// NOTA: los endpoints /arasaac/materials/* corresponden a la tarea ARA-04 y
// aún no están publicados en USAER45_Back; la página maneja el error con
// gracia (getApiErrorMessage) mientras tanto.

interface MaterialState {
  query: string
  results: ArasaacMaterial[]
  loading: boolean
  error: string | null
  search: (query: string) => Promise<void>
  clearResults: () => void
  // Resuelve la URL de descarga de un material cuando la búsqueda no la trae.
  resolveDownloadUrl: (id: number) => Promise<string | null>
}

export const useMaterialStore = create<MaterialState>()((set) => ({
  query: '',
  results: [],
  loading: false,
  error: null,

  async search(query) {
    const trimmed = query.trim()
    if (!trimmed) {
      set({ query: '', results: [], error: null })
      return
    }
    set({ query: trimmed, loading: true, error: null })
    try {
      const { data } = await api.get<ArasaacMaterial[]>(
        '/arasaac/materials/search',
        { params: { term: trimmed } },
      )
      set({ results: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },

  clearResults() {
    set({ query: '', results: [], error: null })
  },

  async resolveDownloadUrl(id) {
    const { data } = await api.get<ArasaacMaterial>(
      `/arasaac/materials/${id}`,
    )
    return data.downloadUrl ?? null
  },
}))
