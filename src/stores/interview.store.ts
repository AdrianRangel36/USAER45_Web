import { create } from 'zustand'
import { api } from '@/lib/api'
import type { CreateInterviewInput, Interview } from '@/types'

// POST /interviews es el único endpoint del módulo (sin GET/lista ni PATCH
// alcanzables), así que este store no mantiene una lista de entrevistas.

interface InterviewState {
  submitting: boolean
  submitInterview: (input: CreateInterviewInput) => Promise<Interview>
}

export const useInterviewStore = create<InterviewState>()((set) => ({
  submitting: false,

  async submitInterview(input) {
    set({ submitting: true })
    try {
      const { data } = await api.post<Interview>('/interviews', input)
      return data
    } finally {
      set({ submitting: false })
    }
  },
}))
