import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { GradeCaptureTable } from '@/components/grades/GradeCaptureTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { SUBJECT_LABELS, TECHNIQUE_CATEGORY_LABELS } from '@/lib/labels'
import { useGradeStore } from '@/stores/grade.store'
import { useSessionStore } from '@/stores/session.store'
import { useStudentStore } from '@/stores/student.store'

export function GradeCapturePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const {
    selected: session,
    loading: sessionLoading,
    fetchSession,
    clearSelected,
  } = useSessionStore()
  const { students, loading: studentsLoading, fetchStudents } = useStudentStore()
  const createGrades = useGradeStore((state) => state.createGrades)

  const [period, setPeriod] = useState('')
  const [scores, setScores] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) void fetchSession(sessionId)
    void fetchStudents()
    return () => clearSelected()
  }, [sessionId, fetchSession, fetchStudents, clearSelected])

  function handleScoreChange(studentId: string, value: string) {
    setScores((prev) => ({ ...prev, [studentId]: value }))
  }

  async function handleSubmit() {
    if (!session) return
    setError(null)

    if (!period.trim()) {
      setError('Indica el periodo')
      return
    }

    const grades = Object.entries(scores)
      .filter(([, value]) => value.trim() !== '')
      .map(([studentId, value]) => ({
        studentId,
        sessionId: session.id,
        subject: session.subject,
        score: Number(value),
        period: period.trim(),
      }))

    if (grades.length === 0) {
      setError('Captura al menos una calificación')
      return
    }

    setSubmitting(true)
    try {
      await createGrades(grades)
      toast.success('Calificaciones guardadas')
      navigate('/sesiones')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionLoading || studentsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Sesión no encontrada
      </p>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Capturar calificaciones</h1>
        <p className="text-muted-foreground">
          {session.technique.name} (
          {TECHNIQUE_CATEGORY_LABELS[session.technique.category]}) ·{' '}
          {SUBJECT_LABELS[session.subject]} · {session.sessionDate.slice(0, 10)}
        </p>
      </div>

      <div className="max-w-xs space-y-2">
        <Label htmlFor="period">Periodo</Label>
        <Input
          id="period"
          placeholder="Ej. 2026-1"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />
      </div>

      <GradeCaptureTable
        students={students}
        scores={scores}
        onScoreChange={handleScoreChange}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/sesiones')}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar calificaciones'}
        </Button>
      </div>
    </div>
  )
}
