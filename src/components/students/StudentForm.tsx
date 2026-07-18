import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Textarea } from '@/components/ui/textarea'
import { NEE_LABELS } from '@/lib/labels'
import { getApiErrorMessage } from '@/lib/api'
import { useStudentStore } from '@/stores/student.store'
import type { CreateStudentInput, NeeType, Student, User } from '@/types'

const NEE_TYPES = Object.keys(NEE_LABELS) as NeeType[]

const studentFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Requerido'),
  birthDate: z.string().min(1, 'Requerido'),
  neeType: z.enum(NEE_TYPES as [NeeType, ...NeeType[]]),
  neeDescription: z.string().trim().optional(),
  grade: z.string().trim().min(1, 'Requerido'),
  tutorName: z.string().trim().min(1, 'Requerido'),
  tutorPhone: z.string().trim().optional(),
  teacherId: z.string().optional(),
  consentSigned: z.boolean().refine((value) => value === true, {
    message: 'El tutor debe firmar el aviso de privacidad antes de continuar',
  }),
  consentDate: z.string().min(1, 'Debe indicarse la fecha de firma del consentimiento'),
})

type StudentFormValues = z.infer<typeof studentFormSchema>

function toDateInputValue(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

interface StudentFormProps {
  mode: 'create' | 'edit'
  student?: Student
  teachers: User[]
  onSuccess?: (student: Student) => void
  onCancel?: () => void
}

export function StudentForm({
  mode,
  student,
  teachers,
  onSuccess,
  onCancel,
}: StudentFormProps) {
  const createStudent = useStudentStore((state) => state.createStudent)
  const updateStudent = useStudentStore((state) => state.updateStudent)

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      fullName: student?.fullName ?? '',
      birthDate: toDateInputValue(student?.birthDate),
      neeType: student?.neeType ?? 'OTRO',
      neeDescription: student?.neeDescription ?? '',
      grade: student?.grade ?? '',
      tutorName: student?.tutorName ?? '',
      tutorPhone: student?.tutorPhone ?? '',
      teacherId: student?.teacher?.id ?? '',
      consentSigned: student?.consentSigned ?? false,
      consentDate: toDateInputValue(student?.consentDate),
    },
  })

  const { formState } = form
  const submitError = formState.errors.root?.message

  async function onSubmit(values: StudentFormValues) {
    try {
      const teacherId = values.teacherId || undefined
      if (mode === 'create') {
        const payload: CreateStudentInput = {
          fullName: values.fullName,
          birthDate: values.birthDate,
          neeType: values.neeType,
          neeDescription: values.neeDescription || undefined,
          grade: values.grade,
          tutorName: values.tutorName,
          tutorPhone: values.tutorPhone || undefined,
          teacherId,
          consentSigned: values.consentSigned,
          consentDate: values.consentDate,
        }
        const created = await createStudent(payload)
        onSuccess?.(created)
        return
      }

      // En edición nunca se envían consentSigned/consentDate: el backend
      // rechaza revocar el consentimiento y ya está firmado si el alumno existe.
      const updated = await updateStudent(student!.id, {
        fullName: values.fullName,
        birthDate: values.birthDate,
        neeType: values.neeType,
        neeDescription: values.neeDescription || undefined,
        grade: values.grade,
        tutorName: values.tutorName,
        tutorPhone: values.tutorPhone || undefined,
        teacherId,
      })
      onSuccess?.(updated)
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 3° A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="neeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de NEE</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NEE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {NEE_LABELS[type]}
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
          name="neeDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción de la NEE (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tutorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del tutor(a)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tutorPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono del tutor(a) (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Docente asignado (opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 rounded-md border p-3">
          <FormField
            control={form.control}
            name="consentSigned"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={mode === 'edit'}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    El tutor firmó el aviso de privacidad
                  </FormLabel>
                  {mode === 'edit' && (
                    <p className="text-xs text-muted-foreground">
                      El consentimiento ya firmado no puede revocarse desde
                      aquí.
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="consentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de firma del consentimiento</FormLabel>
                <FormControl>
                  <Input type="date" disabled={mode === 'edit'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting
              ? 'Guardando…'
              : mode === 'create'
                ? 'Registrar alumno'
                : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
