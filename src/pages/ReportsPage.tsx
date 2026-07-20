import { useEffect, useMemo, useState } from 'react'
import { usePDF } from '@react-pdf/renderer'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import { SessionsSummaryReport } from '@/components/reports/SessionsSummaryReport'
import { StudentProgressReport } from '@/components/reports/StudentProgressReport'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api, getApiErrorMessage } from '@/lib/api'
import { SUBJECT_LABELS } from '@/lib/labels'
import {
  buildSessionsReportStats,
  buildStudentReportStats,
  formatDateShort,
  reportFilename,
  type ReportMeta,
  type ReportPayload,
} from '@/lib/report-data'
import { useAuthStore } from '@/stores/auth.store'
import { useStudentStore } from '@/stores/student.store'
import type { GradeRecord, Session, Student, Subject } from '@/types'

// UI-14: interfaz de generación de reportes con vista previa PDF.
// El PDF se genera en el cliente con @react-pdf/renderer a partir de un
// snapshot de datos tomado al presionar "Generar" (no en vivo): renderizar
// un PDF es costoso, así que solo ocurre bajo demanda. usePDF produce UNA
// sola instancia que comparten la vista previa (iframe) y el botón de
// descarga.

type ReportType = 'student-progress' | 'sessions-summary'
type SubjectFilter = Subject | 'ALL'

const REPORT_TYPES: { value: ReportType; label: string; hint: string }[] = [
  {
    value: 'student-progress',
    label: 'Progreso del alumno',
    hint: 'Datos del alumno, promedios y su historial de calificaciones.',
  },
  {
    value: 'sessions-summary',
    label: 'Resumen de sesiones',
    hint: 'Conteo de sesiones por técnica y materia, con su detalle.',
  },
]

const SUBJECT_OPTIONS: { value: SubjectFilter; label: string }[] = [
  { value: 'ALL', label: 'Lectura y Matemáticas' },
  { value: 'LECTURA', label: SUBJECT_LABELS.LECTURA },
  { value: 'MATEMATICAS', label: SUBJECT_LABELS.MATEMATICAS },
]

function subjectLabelOf(subject: SubjectFilter): string {
  return subject === 'ALL' ? 'Lectura y Matemáticas' : SUBJECT_LABELS[subject]
}

export function ReportsPage() {
  const user = useAuthStore((state) => state.user)
  const { students, fetchStudents } = useStudentStore()

  const [reportType, setReportType] = useState<ReportType>('student-progress')
  const [studentId, setStudentId] = useState('')
  const [subject, setSubject] = useState<SubjectFilter>('ALL')
  const [period, setPeriod] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [payload, setPayload] = useState<ReportPayload | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [instance, updateInstance] = usePDF()

  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  const activeStudents = useMemo(
    () => students.filter((s) => s.isActive),
    [students],
  )

  const canGenerate =
    !fetching && (reportType === 'sessions-summary' || studentId !== '')

  async function generate() {
    setFetching(true)
    setFetchError(null)
    try {
      const meta: ReportMeta = {
        generatedByName: user?.name ?? 'Sistema',
        generatedAtISO: new Date().toISOString(),
      }

      let nextPayload: ReportPayload
      if (reportType === 'student-progress') {
        const [{ data: student }, { data: grades }] = await Promise.all([
          api.get<Student>(`/students/${studentId}`),
          api.get<GradeRecord[]>(`/grades/student/${studentId}`, {
            params: {
              subject: subject === 'ALL' ? undefined : subject,
              period: period.trim() || undefined,
            },
          }),
        ])
        nextPayload = {
          kind: 'student-progress',
          student,
          grades,
          stats: buildStudentReportStats(grades),
          filters: {
            subjectLabel: subjectLabelOf(subject),
            periodLabel: period.trim() || 'Todos',
          },
          meta,
        }
      } else {
        const { data: sessions } = await api.get<Session[]>('/sessions')
        const filtered = sessions.filter((session) => {
          const day = session.sessionDate.slice(0, 10)
          if (subject !== 'ALL' && session.subject !== subject) return false
          if (dateFrom && day < dateFrom) return false
          if (dateTo && day > dateTo) return false
          return true
        })
        const rangeLabel =
          dateFrom || dateTo
            ? `${dateFrom ? formatDateShort(dateFrom) : 'Inicio'} — ${dateTo ? formatDateShort(dateTo) : 'Hoy'}`
            : 'Todo el historial'
        nextPayload = {
          kind: 'sessions-summary',
          sessions: filtered,
          stats: buildSessionsReportStats(filtered),
          filters: { subjectLabel: subjectLabelOf(subject), rangeLabel },
          meta,
        }
      }

      setPayload(nextPayload)
      updateInstance(
        nextPayload.kind === 'student-progress' ? (
          <StudentProgressReport payload={nextPayload} />
        ) : (
          <SessionsSummaryReport payload={nextPayload} />
        ),
      )
    } catch (error) {
      const message = getApiErrorMessage(error)
      setFetchError(message)
      toast.error(message)
    } finally {
      setFetching(false)
    }
  }

  const busy = fetching || instance.loading
  const previewReady = payload !== null && instance.url !== null && !busy

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes en PDF con vista previa para imprimir o archivar
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Configuración */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              {REPORT_TYPES.find((t) => t.value === reportType)?.hint}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de reporte</Label>
              <Select
                value={reportType}
                onValueChange={(v) => setReportType(v as ReportType)}
              >
                <SelectTrigger id="report-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType === 'student-progress' && (
              <div className="space-y-2">
                <Label htmlFor="report-student">Alumno</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger id="report-student" className="w-full">
                    <SelectValue placeholder="Selecciona un alumno" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStudents.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Sin alumnos disponibles
                      </SelectItem>
                    ) : (
                      activeStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.fullName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="report-subject">Materia</Label>
              <Select
                value={subject}
                onValueChange={(v) => setSubject(v as SubjectFilter)}
              >
                <SelectTrigger id="report-subject" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType === 'student-progress' ? (
              <div className="space-y-2">
                <Label htmlFor="report-period">Periodo (opcional)</Label>
                <Input
                  id="report-period"
                  placeholder="Ej. 2026-1"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="report-from">Desde</Label>
                  <Input
                    id="report-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-to">Hasta</Label>
                  <Input
                    id="report-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {fetchError && (
              <p className="text-sm text-destructive" role="alert">
                {fetchError}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={generate} disabled={!canGenerate}>
                {busy ? 'Generando…' : 'Generar vista previa'}
              </Button>
              <Button
                variant="outline"
                asChild
                aria-disabled={!previewReady}
                className={
                  previewReady ? undefined : 'pointer-events-none opacity-50'
                }
              >
                <a
                  href={instance.url ?? '#'}
                  download={payload ? reportFilename(payload) : undefined}
                >
                  Descargar PDF
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card className="overflow-hidden">
          <CardContent className="p-2">
            {busy && <Skeleton className="h-[72vh] w-full" />}

            {!busy && instance.error && (
              <div className="flex h-[72vh] items-center justify-center">
                <p className="text-sm text-destructive" role="alert">
                  No se pudo generar el PDF: {instance.error}
                </p>
              </div>
            )}

            {!busy && !instance.error && previewReady && (
              <iframe
                title="Vista previa del reporte"
                src={instance.url ?? undefined}
                className="h-[72vh] w-full rounded-md border-0"
              />
            )}

            {!busy && !instance.error && !previewReady && (
              <div className="flex h-[72vh] flex-col items-center justify-center gap-3 text-center">
                <FileText
                  className="size-10 text-muted-foreground"
                  aria-hidden
                />
                <div>
                  <p className="font-medium">Sin vista previa</p>
                  <p className="text-sm text-muted-foreground">
                    Configura el reporte y presiona «Generar vista previa»
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
