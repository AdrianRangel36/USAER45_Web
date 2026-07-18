import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type {
  BehavioralRecord,
  BehavioralRubric,
  CreateBehavioralRecordInput,
} from '@/types'

// GET /rubrics: lista rúbricas activas. No hay endpoint alcanzable para
// crear/editar rúbricas desde el frontend (UpdateRubricDto existe pero no
// tiene ruta), así que este store solo cubre lectura + registro de
// evaluaciones conductuales (POST /rubrics/:id/records).

interface RubricState {
  rubrics: BehavioralRubric[]
  loading: boolean
  error: string | null
  fetchRubrics: () => Promise<void>
  createRecord: (
    rubricId: string,
    input: CreateBehavioralRecordInput,
  ) => Promise<BehavioralRecord>
}

export const useRubricStore = create<RubricState>()((set) => ({
  rubrics: [],
  loading: false,
  error: null,

  async fetchRubrics() {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<BehavioralRubric[]>('/rubrics')
      set({ rubrics: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },

  async createRecord(rubricId, input) {
    const { data } = await api.post<BehavioralRecord>(
      `/rubrics/${rubricId}/records`,
      input,
    )
    return data
  },
}))
