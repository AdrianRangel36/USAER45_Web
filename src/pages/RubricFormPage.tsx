import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RubricCriterionScale } from '@/components/rubrics/RubricCriterionScale'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api'
import { useRubricStore } from '@/stores/rubric.store'
import { useSessionStore } from '@/stores/session.store'
import { useStudentStore } from '@/stores/student.store'

export function RubricFormPage() {
  const navigate = useNavigate()
  const rubrics = useRubricStore((state) => state.rubrics)
  const fetchRubrics = useRubricStore((state) => state.fetchRubrics)
  const createRecord = useRubricStore((state) => state.createRecord)
  const students = useStudentStore((state) => state.students)
  const fetchStudents = useStudentStore((state) => state.fetchStudents)
  const sessions = useSessionStore((state) => state.sessions)
  const fetchSessions = useSessionStore((state) => state.fetchSessions)

  const [rubricId, setRubricId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [observations, setObservations] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchRubrics()
    void fetchStudents()
    void fetchSessions()
  }, [fetchRubrics, fetchStudents, fetchSessions])

  useEffect(() => {
    if (!rubricId && rubrics.length === 1) {
      setRubricId(rubrics[0].id)
    }
  }, [rubrics, rubricId])

  const rubric = rubrics.find((r) => r.id === rubricId)

  function handleScoreChange(criterionId: string, value: number) {
    setScores((prev) => ({ ...prev, [criterionId]: value }))
  }

  async function handleSubmit() {
    setError(null)
    if (!rubric) {
      setError('Selecciona una rúbrica')
      return
    }
    if (!studentId || !sessionId) {
      setError('Selecciona alumno y sesión')
      return
    }
    if (rubric.criteria.some((c) => scores[c.id] === undefined)) {
      setError('Completa todos los criterios')
      return
    }

    setSubmitting(true)
    try {
      await createRecord(rubric.id, {
        studentId,
        sessionId,
        scores,
        observations: observations.trim() || undefined,
      })
      toast.success('Evaluación conductual guardada')
      navigate('/')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Rúbrica de conducta</h1>
        <p className="text-muted-foreground">
          Evalúa el comportamiento del alumno durante una sesión
        </p>
      </div>

      {rubrics.length > 1 && (
        <div className="space-y-2">
          <Label>Rúbrica</Label>
          <Select value={rubricId} onValueChange={setRubricId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una rúbrica" />
            </SelectTrigger>
            <SelectContent>
              {rubrics.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Alumno</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un alumno" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sesión</Label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una sesión" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.sessionDate.slice(0, 10)} · {s.technique.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {rubric && (
        <div className="space-y-3">
          {rubric.criteria.map((criterion) => (
            <RubricCriterionScale
              key={criterion.id}
              criterion={criterion}
              value={scores[criterion.id]}
              onChange={(value) => handleScoreChange(criterion.id, value)}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label>Observaciones (opcional)</Label>
        <Textarea
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar evaluación'}
        </Button>
      </div>
    </div>
  )
}
