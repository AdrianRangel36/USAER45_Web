import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PictogramPicker } from '@/components/arasaac/PictogramPicker'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api'
import { SUBJECT_LABELS } from '@/lib/labels'
import { useSessionStore } from '@/stores/session.store'
import { useTechniqueStore } from '@/stores/technique.store'
import type { ArasaacPictogram, Subject } from '@/types'

const SUBJECTS = Object.keys(SUBJECT_LABELS) as Subject[]

const sessionFormSchema = z.object({
  techniqueId: z.string().min(1, 'Selecciona una técnica'),
  subject: z.enum(SUBJECTS as [Subject, ...Subject[]]),
  sessionDate: z.string().min(1, 'Requerido'),
  notes: z.string().trim().optional(),
})

type SessionFormValues = z.infer<typeof sessionFormSchema>

export function SessionFormPage() {
  const navigate = useNavigate()
  const techniques = useTechniqueStore((state) => state.techniques)
  const fetchTechniques = useTechniqueStore((state) => state.fetchTechniques)
  const createSession = useSessionStore((state) => state.createSession)
  const [pictograms, setPictograms] = useState<ArasaacPictogram[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    void fetchTechniques()
  }, [fetchTechniques])

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      techniqueId: '',
      subject: 'LECTURA',
      sessionDate: '',
      notes: '',
    },
  })

  const techniqueId = form.watch('techniqueId')
  const selectedTechnique = techniques.find((t) => t.id === techniqueId)
  const isVisual = selectedTechnique?.category === 'VISUAL'

  async function onSubmit(values: SessionFormValues) {
    setSubmitError(null)
    try {
      const session = await createSession({
        techniqueId: values.techniqueId,
        subject: values.subject,
        sessionDate: values.sessionDate,
        notes: values.notes || undefined,
      })
      navigate(`/sesiones/${session.id}/calificaciones`)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Nueva sesión</h1>
        <p className="text-muted-foreground">
          Registra la técnica de enseñanza aplicada en esta sesión de trabajo
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="detalles">
            <TabsList>
              <TabsTrigger value="detalles">Detalles</TabsTrigger>
              {isVisual && (
                <TabsTrigger value="arasaac">Apoyo visual ARASAAC</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="detalles" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="techniqueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnica de enseñanza</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una técnica" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {techniques.map((technique) => (
                          <SelectItem key={technique.id} value={technique.id}>
                            {technique.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBJECTS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {SUBJECT_LABELS[subject]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de la sesión</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {isVisual && (
              <TabsContent value="arasaac" className="pt-4">
                <PictogramPicker
                  selected={pictograms}
                  onChange={setPictograms}
                />
              </TabsContent>
            )}
          </Tabs>

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/sesiones')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? 'Guardando…'
                : 'Registrar sesión'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
