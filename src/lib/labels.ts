import type { NeeType, Role, Subject, TechniqueCategory } from '@/types'

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador(a)',
  DOCENTE: 'Docente',
  DIRECTIVO: 'Directivo(a)',
}

export const NEE_LABELS: Record<NeeType, string> = {
  DEFICIT_ATENCION: 'Déficit de atención',
  DIFICULTAD_APRENDIZAJE: 'Dificultad de aprendizaje',
  DISCAPACIDAD_INTELECTUAL: 'Discapacidad intelectual',
  TRASTORNO_LENGUAJE: 'Trastorno del lenguaje',
  OTRO: 'Otro',
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  LECTURA: 'Lectura',
  MATEMATICAS: 'Matemáticas',
}

export const TECHNIQUE_CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  VISUAL: 'Visual',
  LUDICA: 'Lúdica',
  REPETICION: 'Repetición',
  OTRA: 'Otra',
}
