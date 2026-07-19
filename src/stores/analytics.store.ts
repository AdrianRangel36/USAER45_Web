import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type {
  AnalyticsSummary,
  ComparisonParams,
  TechniqueComparison,
} from '@/types'

// UI-12 / UI-13: analítica del sistema.
//  - summary:    GET  /analytics/summary     (métricas generales, todos los roles)
//  - comparison: POST /analytics/comparison  (por técnica + evolución, ADMIN/DIRECTIVO)
//
// NOTA: el módulo /analytics es la tarea del microservicio de analítica
// (ANL-*); mientras no esté publicado, las páginas muestran el error con
// gracia. loading/error se manejan por separado para cada consulta.

interface AnalyticsState {
  summary: AnalyticsSummary | null
  comparison: TechniqueComparison | null
  loadingSummary: boolean
  loadingComparison: boolean
  errorSummary: string | null
  errorComparison: string | null
  fetchSummary: () => Promise<void>
  fetchComparison: (params?: ComparisonParams) => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  summary: null,
  comparison: null,
  loadingSummary: false,
  loadingComparison: false,
  errorSummary: null,
  errorComparison: null,

  async fetchSummary() {
    set({ loadingSummary: true, errorSummary: null })
    try {
      const { data } = await api.get<AnalyticsSummary>('/analytics/summary')
      set({ summary: data, loadingSummary: false })
    } catch (error) {
      set({ loadingSummary: false, errorSummary: getApiErrorMessage(error) })
    }
  },

  async fetchComparison(params) {
    set({ loadingComparison: true, errorComparison: null })
    try {
      const { data } = await api.post<TechniqueComparison>(
        '/analytics/comparison',
        params ?? {},
      )
      set({ comparison: data, loadingComparison: false })
    } catch (error) {
      set({
        loadingComparison: false,
        errorComparison: getApiErrorMessage(error),
      })
    }
  },
}))
