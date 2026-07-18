import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'
import { useInterviewStore } from '@/stores/interview.store'

// Instrumento 3 (guía de entrevista semiestructurada), Actividad 3.2 del
// documento de contexto de la investigación — preguntas fijas, sin catálogo
// dinámico, ya que "responses" en el backend es un Json libre.
const QUESTIONS: { key: string; label: string }[] = [
  {
    key: 'p1',
    label:
      'Desde su perspectiva técnica, ¿cuáles son los cambios más significativos que observó en la asimilación cognitiva de los alumnos al transicionar de la repetición tradicional hacia entornos lúdicos o visuales?',
  },
  {
    key: 'p2',
    label:
      '¿De qué manera el aprendizaje lúdico influyó en los mecanismos emocionales y de autorregulación de los alumnos con barreras para el aprendizaje?',
  },
  {
    key: 'p3',
    label:
      '¿Qué ventajas operativas o limitaciones técnicas experimentó al usar la plataforma web frente a los expedientes físicos convencionales?',
  },
]

export function InterviewFormPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const submitInterview = useInterviewStore((state) => state.submitInterview)
  const submitting = useInterviewStore((state) => state.submitting)

  const [period, setPeriod] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!user) return
    if (!period.trim()) {
      setError('Indica el periodo')
      return
    }
    if (QUESTIONS.some((q) => !responses[q.key]?.trim())) {
      setError('Responde las tres preguntas')
      return
    }

    try {
      await submitInterview({
        teacherId: user.id,
        period: period.trim(),
        responses,
        notes: notes.trim() || undefined,
      })
      toast.success('Entrevista registrada')
      navigate('/')
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Entrevista semiestructurada</h1>
        <p className="text-muted-foreground">
          Registra tu perspectiva pedagógica al cierre del periodo de
          evaluación
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="interview-period">Periodo</Label>
          <Input
            id="interview-period"
            placeholder="Ej. Junio 2026"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>

        {QUESTIONS.map((question) => (
          <div key={question.key} className="space-y-2">
            <Label htmlFor={question.key}>{question.label}</Label>
            <Textarea
              id={question.key}
              rows={4}
              value={responses[question.key] ?? ''}
              onChange={(e) =>
                setResponses((prev) => ({
                  ...prev,
                  [question.key]: e.target.value,
                }))
              }
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="interview-notes">Notas adicionales (opcional)</Label>
          <Textarea
            id="interview-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Registrar entrevista'}
          </Button>
        </div>
      </form>
    </div>
  )
}
