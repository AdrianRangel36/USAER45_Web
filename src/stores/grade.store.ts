import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type { CreateGradeRecordInput, GradeRecord, Subject } from '@/types'

// Sigue el contrato del módulo /grades de USAER45_Back: POST /grades crea un
// lote (mínimo 1) dentro de una sola transacción, y GET /grades/student/:id
// devuelve el historial con la sesión anidada. El backend valida que la
// materia de cada calificación coincida con la de su sesión.

interface GradeState {
  records: GradeRecord[]
  loading: boolean
  error: string | null
  createGrades: (grades: CreateGradeRecordInput[]) => Promise<GradeRecord[]>
  fetchByStudent: (
    studentId: string,
    filters?: { subject?: Subject; period?: string },
  ) => Promise<void>
  clearRecords: () => void
}

export const useGradeStore = create<GradeState>()((set) => ({
  records: [],
  loading: false,
  error: null,

  async createGrades(grades) {
    const { data } = await api.post<GradeRecord[]>('/grades', { grades })
    return data
  },

  async fetchByStudent(studentId, filters) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<GradeRecord[]>(
        `/grades/student/${studentId}`,
        { params: filters },
      )
      set({ records: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },

  clearRecords() {
    set({ records: [] })
  },
}))
