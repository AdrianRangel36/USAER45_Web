import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type { ArasaacPictogram, SavedPictogram } from '@/types'

// Búsqueda de pictogramas vía el proxy propio del backend (GET /arasaac/search,
// con caché en memoria) + pictogramas guardados (modelo SavedPictogram;
// endpoints /pictograms/saved aún pendientes de publicarse en USAER45_Back).

interface ArasaacState {
  query: string
  results: ArasaacPictogram[]
  saved: SavedPictogram[]
  loading: boolean
  error: string | null
  search: (query: string) => Promise<void>
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

  async search(query) {
    const trimmed = query.trim()
    if (!trimmed) {
      set({ query: '', results: [], error: null })
      return
    }
    set({ query: trimmed, loading: true, error: null })
    try {
      const { data } = await api.get<ArasaacPictogram[]>('/arasaac/search', {
        params: { term: trimmed },
      })
      set({ results: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
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
    const keyword = pictogram.keywords[0] ?? String(pictogram.id)
    const { data } = await api.post<SavedPictogram>('/pictograms/saved', {
      arasaacPictogramId: pictogram.id,
      keyword,
      imageUrl: pictogram.imageUrl,
      tags: [],
    })
    set({ saved: [...get().saved, data] })
  },

  async removeSaved(id) {
    await api.delete(`/pictograms/saved/${id}`)
    set({ saved: get().saved.filter((p) => p.id !== id) })
  },
}))
