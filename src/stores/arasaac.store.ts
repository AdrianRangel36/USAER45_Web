import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import { pictogramImageUrl, searchPictograms } from '@/lib/arasaac'
import type { ArasaacPictogram, SavedPictogram } from '@/types'

// Búsqueda contra la API pública de ARASAAC + pictogramas guardados en
// nuestro backend (modelo SavedPictogram; endpoints /pictograms pendientes
// de publicarse en USAER45_Back).

interface ArasaacState {
  query: string
  results: ArasaacPictogram[]
  saved: SavedPictogram[]
  loading: boolean
  error: string | null
  search: (query: string, locale?: string) => Promise<void>
  clearResults: () => void
  fetchSaved: () => Promise<void>
  savePictogram: (pictogram: ArasaacPictogram) => Promise<void>
  removeSaved: (id: string) => Promise<void>
}

export const useArasaacStore = create<ArasaacState>()((set, get) => ({
  query: '',
  results: [],
  saved: [],
  loading: false,
  error: null,

  async search(query, locale = 'es') {
    const trimmed = query.trim()
    if (!trimmed) {
      set({ query: '', results: [], error: null })
      return
    }
    set({ query: trimmed, loading: true, error: null })
    try {
      const results = await searchPictograms(trimmed, locale)
      set({ results, loading: false })
    } catch {
      set({
        loading: false,
        error: 'No se pudo consultar ARASAAC. Intenta de nuevo.',
      })
    }
  },

  clearResults() {
    set({ query: '', results: [], error: null })
  },

  async fetchSaved() {
    try {
      const { data } = await api.get<SavedPictogram[]>('/pictograms/saved')
      set({ saved: data })
    } catch (error) {
      set({ error: getApiErrorMessage(error) })
    }
  },

  async savePictogram(pictogram) {
    const keyword = pictogram.keywords[0]?.keyword ?? String(pictogram._id)
    const { data } = await api.post<SavedPictogram>('/pictograms/saved', {
      arasaacPictogramId: pictogram._id,
      keyword,
      imageUrl: pictogramImageUrl(pictogram._id, 500),
      tags: pictogram.tags ?? [],
    })
    set({ saved: [...get().saved, data] })
  },

  async removeSaved(id) {
    await api.delete(`/pictograms/saved/${id}`)
    set({ saved: get().saved.filter((p) => p.id !== id) })
  },
}))
