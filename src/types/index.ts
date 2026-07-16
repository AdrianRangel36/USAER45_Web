// Tipos compartidos del frontend, espejo del contrato del backend
// (USAER45_Back: prisma/schema.prisma y respuestas de la API).

export type Role = 'ADMIN' | 'DOCENTE' | 'DIRECTIVO'

export type Subject = 'LECTURA' | 'MATEMATICAS'

export type NeeType =
  | 'DEFICIT_ATENCION'
  | 'DIFICULTAD_APRENDIZAJE'
  | 'DISCAPACIDAD_INTELECTUAL'
  | 'TRASTORNO_LENGUAJE'
  | 'OTRO'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  isActive?: boolean
}

// Respuesta de POST /auth/login
export interface LoginResponse {
  token: string
  user: User
}

export interface Student {
  id: string
  fullName: string
  birthDate: string
  neeType: NeeType
  neeDescription?: string | null
  grade: string
  tutorName: string
  tutorPhone?: string | null
  consentSigned: boolean
  consentDate?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateStudentInput = Omit<
  Student,
  'id' | 'isActive' | 'createdAt' | 'updatedAt'
>

// Resultado de búsqueda de la API pública de ARASAAC
// (https://api.arasaac.org/v1/pictograms/{locale}/search/{texto})
export interface ArasaacPictogram {
  _id: number
  keywords: { keyword: string; meaning?: string; plural?: string }[]
  tags: string[]
  schematic?: boolean
}

// Pictograma guardado por el usuario en el backend (modelo SavedPictogram)
export interface SavedPictogram {
  id: string
  arasaacPictogramId: number
  keyword: string
  imageUrl: string
  tags: string[]
}
