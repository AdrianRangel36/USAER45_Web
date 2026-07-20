import { SUBJECT_LABELS, TECHNIQUE_CATEGORY_LABELS } from '@/lib/labels'
import type {
  GradeRecord,
  Session,
  Student,
  Subject,
  TechniqueCategory,
} from '@/types'

// UI-14: armado de los datos de los reportes PDF. Los documentos de
// components/reports/ reciben estos payloads ya calculados (snapshot
// inmutable) para que el render del PDF sea una función pura de los datos.

export interface ReportMeta {
  generatedByName: string
  generatedAtISO: string
}

export interface ReportFilters {
  subjectLabel: string
  periodLabel: string
}

// ─── Reporte de progreso del alumno ─────────────────────────────────────────

export interface SubjectAverage {
  subject: Subject
  average: number
  count: number
}

export interface TechniqueStat {
  name: string
  category: TechniqueCategory
  average: number
  count: number
}

export interface StudentReportStats {
  overallAverage: number | null
  totalRecords: number
  periods: string[]
  bySubject: SubjectAverage[]
  byTechnique: TechniqueStat[]
  bestTechnique: TechniqueStat | null
}

export interface StudentReportPayload {
  kind: 'student-progress'
  student: Student
  grades: GradeRecord[]
  stats: StudentReportStats
  filters: ReportFilters
  meta: ReportMeta
}

export function buildStudentReportStats(
  grades: GradeRecord[],
): StudentReportStats {
  const scores = grades.map((g) => Number(g.score))
  const overallAverage =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : null

  const periods = [...new Set(grades.map((g) => g.period))].sort()

  const subjectMap = new Map<Subject, { sum: number; count: number }>()
  for (const grade of grades) {
    const acc = subjectMap.get(grade.subject) ?? { sum: 0, count: 0 }
    acc.sum += Number(grade.score)
    acc.count += 1
    subjectMap.set(grade.subject, acc)
  }
  const bySubject = [...subjectMap.entries()].map(([subject, acc]) => ({
    subject,
    average: acc.sum / acc.count,
    count: acc.count,
  }))

  const techniqueMap = new Map<
    string,
    { name: string; category: TechniqueCategory; sum: number; count: number }
  >()
  for (const grade of grades) {
    const technique = grade.session?.technique
    if (!technique) continue
    const acc = techniqueMap.get(technique.id) ?? {
      name: technique.name,
      category: technique.category,
      sum: 0,
      count: 0,
    }
    acc.sum += Number(grade.score)
    acc.count += 1
    techniqueMap.set(technique.id, acc)
  }
  const byTechnique = [...techniqueMap.values()]
    .map((acc) => ({
      name: acc.name,
      category: acc.category,
      average: acc.sum / acc.count,
      count: acc.count,
    }))
    .sort((a, b) => b.average - a.average)

  return {
    overallAverage,
    totalRecords: grades.length,
    periods,
    bySubject,
    byTechnique,
    bestTechnique: byTechnique[0] ?? null,
  }
}

// ─── Reporte de resumen de sesiones ─────────────────────────────────────────

export interface CountStat {
  label: string
  count: number
  percent: number
}

export interface SessionsReportStats {
  total: number
  teacherCount: number
  firstDate: string | null
  lastDate: string | null
  bySubject: CountStat[]
  byTechnique: CountStat[]
}

export interface SessionsReportFilters {
  subjectLabel: string
  rangeLabel: string
}

export interface SessionsReportPayload {
  kind: 'sessions-summary'
  sessions: Session[]
  stats: SessionsReportStats
  filters: SessionsReportFilters
  meta: ReportMeta
}

export type ReportPayload = StudentReportPayload | SessionsReportPayload

function toCountStats<K extends string>(
  entries: Map<K, number>,
  total: number,
  labelOf: (key: K) => string,
): CountStat[] {
  return [...entries.entries()]
    .map(([key, count]) => ({
      label: labelOf(key),
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function buildSessionsReportStats(
  sessions: Session[],
): SessionsReportStats {
  const dates = sessions.map((s) => s.sessionDate).sort()

  const bySubject = new Map<Subject, number>()
  const byTechnique = new Map<TechniqueCategory, number>()
  const teacherIds = new Set<string>()
  for (const session of sessions) {
    bySubject.set(session.subject, (bySubject.get(session.subject) ?? 0) + 1)
    byTechnique.set(
      session.technique.category,
      (byTechnique.get(session.technique.category) ?? 0) + 1,
    )
    teacherIds.add(session.teacher.id)
  }

  return {
    total: sessions.length,
    teacherCount: teacherIds.size,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    bySubject: toCountStats(
      bySubject,
      sessions.length,
      (s) => SUBJECT_LABELS[s],
    ),
    byTechnique: toCountStats(
      byTechnique,
      sessions.length,
      (t) => TECHNIQUE_CATEGORY_LABELS[t],
    ),
  }
}

// ─── Utilidades compartidas ─────────────────────────────────────────────────

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateLong(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatScore(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toFixed(1)
}

export function reportFilename(payload: ReportPayload): string {
  const date = payload.meta.generatedAtISO.slice(0, 10)
  if (payload.kind === 'student-progress') {
    const slug = payload.student.fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    return `reporte-progreso-${slug}-${date}.pdf`
  }
  return `reporte-sesiones-${date}.pdf`
}
