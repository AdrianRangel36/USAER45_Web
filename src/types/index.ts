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

// Tonos de piel aceptados por GET /arasaac/search?skin= (espejo de
// ARASAAC_SKINS en USAER45_Back; "assian" es la grafía de ARASAAC).
export type ArasaacSkin = 'white' | 'black' | 'assian' | 'mulatto' | 'aztec'

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

// ─── ARASAAC · Materiales didácticos (UI-11 / ARA-04) ───────────────────────
// Resultado de búsqueda de materiales vía el proxy propio del backend
// (GET /arasaac/materials/search?term=), que transforma la respuesta cruda de
// ARASAAC y arma las URLs completas de miniatura y descarga.
// NOTA: los endpoints /arasaac/materials/* son la tarea ARA-04 (aún por
// publicar en USAER45_Back); este tipo define el contrato esperado.
export interface ArasaacMaterial {
  id: number
  title: string
  description?: string | null
  authors?: string[]
  downloads?: number | null
  language?: string | null
  thumbnailUrl?: string | null
  screenshots?: string[]
  // URL directa de descarga; si el backend no la incluye en la búsqueda, se
  // resuelve con GET /arasaac/materials/:id (ver material.store.ts).
  downloadUrl?: string | null
}

// ─── Analítica (UI-12 / UI-13) ──────────────────────────────────────────────
// Contrato esperado del módulo /analytics de USAER45_Back (tareas ANL-*).
// GET /analytics/summary — métricas generales del dashboard (todos los roles).
export interface AnalyticsSummary {
  totals: {
    students: number
    sessions: number
    grades: number
    behavioralRecords: number
    techniques: number
  }
  gradesBySubject: { subject: Subject; average: number | null; count: number }[]
  sessionsByTechnique: { technique: TechniqueCategory; count: number }[]
  lastSessionDate?: string | null
}

// Promedio de una técnica en un período (para las gráficas de UI-13).
export interface TechniqueAverage {
  technique: TechniqueCategory
  average: number | null // promedio de calificación 0–10
  sessions: number
  behaviorAverage: number | null // promedio conductual 1–4
}

// Punto de evolución por período: un promedio de calificación por técnica.
export interface EvolutionPoint {
  period: string
  VISUAL: number | null
  LUDICA: number | null
  REPETICION: number | null
}

// ─── ANL-08: significancia estadística real (analytics-service) ─────────────
// Espejo camelCase de la respuesta de POST /compute/comparison, ya mapeada
// por el backend. Uno por materia; cuando el filtro es "Ambas" vienen dos.
export interface AnovaResult {
  groupsCompared: TechniqueCategory[]
  fStatistic: number | null
  pValue: number | null
  significant: boolean
}

export interface PairwiseTTest {
  techniqueA: TechniqueCategory
  techniqueB: TechniqueCategory
  nA: number
  nB: number
  tStatistic: number | null
  pValue: number | null
  significant: boolean
}

export interface CategorySampleSize {
  technique: TechniqueCategory
  n: number
  included: boolean
}

export interface SubjectStatisticalAnalysis {
  subject: Subject
  sufficientData: boolean
  anova: AnovaResult | null
  pairwiseTTests: PairwiseTTest[]
  categorySampleSizes: CategorySampleSize[]
}

// POST /analytics/comparison — análisis comparativo por técnica (ADMIN/DIRECTIVO).
// Body: { subject?: Subject; period?: string } — sin subject, combina Lectura + Matemáticas.
export interface TechniqueComparison {
  subject: Subject | 'ALL'
  byTechnique: TechniqueAverage[]
  evolution: EvolutionPoint[]
  bestTechnique?: TechniqueCategory | null
  // ANL-08: null cuando analytics-service no respondió (modo degradado); en
  // ese caso byTechnique/bestTechnique siguen viniendo con el cálculo local
  // de respaldo, pero sin ANOVA/t-tests.
  statisticalAnalysis: SubjectStatisticalAnalysis[] | null
  degraded: boolean
}

export interface ComparisonParams {
  subject?: Subject
  period?: string
}
