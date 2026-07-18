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
  teacher?: { id: string; name: string } | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateStudentInput = Omit<
  Student,
  'id' | 'teacher' | 'isActive' | 'createdAt' | 'updatedAt'
> & {
  teacherId?: string
}

// Resultado de búsqueda de pictogramas vía el proxy propio del backend
// (GET /arasaac/search?term=), que ya transforma la respuesta cruda de
// ARASAAC y arma la URL completa de la imagen.
export interface ArasaacPictogram {
  id: number
  keywords: string[]
  imageUrl: string
}

// Pictograma guardado por el usuario en el backend (modelo SavedPictogram;
// los endpoints /pictograms/saved aún no están publicados en USAER45_Back).
export interface SavedPictogram {
  id: string
  arasaacPictogramId: number
  keyword: string
  imageUrl: string
  tags: string[]
}

export type TechniqueCategory = 'VISUAL' | 'LUDICA' | 'REPETICION' | 'OTRA'

export interface TeachingTechnique {
  id: string
  name: string
  category: TechniqueCategory
  description?: string | null
  createdAt: string
}

export interface Session {
  id: string
  subject: Subject
  sessionDate: string
  notes?: string | null
  teacher: { id: string; name: string }
  technique: { id: string; name: string; category: TechniqueCategory }
  createdAt: string
}

export interface CreateSessionInput {
  techniqueId: string
  subject: Subject
  sessionDate: string
  notes?: string
}

// score llega como string en la respuesta: GradeRecord.score es un Decimal(4,2)
// de Prisma, que se serializa como string vía su toJSON() al pasar por JSON.
export interface GradeRecord {
  id: string
  studentId: string
  sessionId: string
  subject: Subject
  score: string
  period: string
  createdAt: string
  updatedAt: string
  session?: {
    id: string
    sessionDate: string
    technique: { id: string; name: string; category: TechniqueCategory }
  }
}

// El request sí valida score como number (0-10, máx. 2 decimales).
export interface CreateGradeRecordInput {
  studentId: string
  sessionId: string
  subject: Subject
  score: number
  period: string
}

// La rúbrica sembrada (seed.ts) guarda "escala" como {min,max,etiquetas},
// pero CreateRubricDto solo valida "escala" como string — el campo es un
// Json libre en Prisma, así que puede venir en cualquiera de las dos formas.
export interface RubricCriterionScaleObject {
  min: number
  max: number
  etiquetas: Record<string, string>
}

export interface RubricCriterion {
  id: string
  nombre: string
  descripcion: string
  escala: string | RubricCriterionScaleObject
}

export interface BehavioralRubric {
  id: string
  name: string
  description?: string | null
  criteria: RubricCriterion[]
  isActive: boolean
  createdAt: string
}

export interface BehavioralRecord {
  id: string
  studentId: string
  sessionId: string
  rubricId: string
  scores: Record<string, number>
  observations?: string | null
  createdAt: string
}

// rubricId viene de la URL (/rubrics/:id/records), no del body.
export interface CreateBehavioralRecordInput {
  studentId: string
  sessionId: string
  scores: Record<string, number>
  observations?: string
}

export interface Interview {
  id: string
  teacherId: string
  period: string
  responses: Record<string, string>
  notes?: string | null
  createdAt: string
}

// teacherId NO se deriva del JWT en este endpoint: debe enviarse explícito.
export interface CreateInterviewInput {
  teacherId: string
  period: string
  responses: Record<string, string>
  notes?: string
}
