import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import type { CreateStudentInput, Student } from '@/types'

// Sigue el contrato del modelo Student de USAER45_Back (prisma/schema.prisma).
// El módulo /students del backend aún no está publicado; cuando exista,
// estas acciones funcionarán sin cambios.

interface StudentState {
  students: Student[]
  selected: Student | null
  loading: boolean
  error: string | null
  fetchStudents: () => Promise<void>
  fetchStudent: (id: string) => Promise<void>
  createStudent: (input: CreateStudentInput) => Promise<Student>
  updateStudent: (id: string, input: Partial<CreateStudentInput>) => Promise<Student>
  deactivateStudent: (id: string) => Promise<void>
  clearSelected: () => void
}

export const useStudentStore = create<StudentState>()((set, get) => ({
  students: [],
  selected: null,
  loading: false,
  error: null,

  async fetchStudents() {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<Student[]>('/students')
      set({ students: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },

  async fetchStudent(id) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<Student>(`/students/${id}`)
      set({ selected: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) })
    }
  },

  async createStudent(input) {
    const { data } = await api.post<Student>('/students', input)
    set({ students: [...get().students, data] })
    return data
  },

  async updateStudent(id, input) {
    const { data } = await api.patch<Student>(`/students/${id}`, input)
    set({
      students: get().students.map((s) => (s.id === id ? data : s)),
      selected: get().selected?.id === id ? data : get().selected,
    })
    return data
  },

  async deactivateStudent(id) {
    await api.delete(`/students/${id}`)
    set({ students: get().students.filter((s) => s.id !== id) })
  },

  clearSelected() {
    set({ selected: null })
  },
}))
