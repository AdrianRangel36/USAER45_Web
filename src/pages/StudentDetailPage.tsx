import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { StudentForm } from '@/components/students/StudentForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { NEE_LABELS, SUBJECT_LABELS, TECHNIQUE_CATEGORY_LABELS } from '@/lib/labels'
import { useAuthStore } from '@/stores/auth.store'
import { useGradeStore } from '@/stores/grade.store'
import { useStudentStore } from '@/stores/student.store'
import type { Subject, User } from '@/types'

const SUBJECT_FILTER_ALL = 'ALL'

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const hasRole = useAuthStore((state) => state.hasRole)
  const { selected: student, loading, error, fetchStudent, clearSelected } =
    useStudentStore()
  const {
    records: grades,
    loading: gradesLoading,
    fetchByStudent,
    clearRecords,
  } = useGradeStore()

  const [editOpen, setEditOpen] = useState(false)
  const [teachers, setTeachers] = useState<User[]>([])
  const [subjectFilter, setSubjectFilter] = useState<string>(
    SUBJECT_FILTER_ALL,
  )
  const [periodFilter, setPeriodFilter] = useState('')

  useEffect(() => {
    if (id) void fetchStudent(id)
    return () => clearSelected()
  }, [id, fetchStudent, clearSelected])

  useEffect(() => {
    if (!id) return
    void fetchByStudent(id, {
      subject:
        subjectFilter === SUBJECT_FILTER_ALL
          ? undefined
          : (subjectFilter as Subject),
      period: periodFilter.trim() || undefined,
    })
    return () => clearRecords()
  }, [id, subjectFilter, periodFilter, fetchByStudent, clearRecords])

  useEffect(() => {
    if (!editOpen || !hasRole('ADMIN')) return
    api
      .get<User[]>('/users')
      .then(({ data }) =>
        setTeachers(data.filter((u) => u.role === 'DOCENTE' && u.isActive)),
      )
      .catch(() => setTeachers([]))
  }, [editOpen, hasRole])

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error ?? 'Alumno no encontrado'}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{student.fullName}</h1>
          <p className="text-muted-foreground">
            {student.grade} · {NEE_LABELS[student.neeType]}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/alumnos')}>
            Volver
          </Button>
          {hasRole('ADMIN') && (
            <Button onClick={() => setEditOpen(true)}>Editar</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="pt-4">
          <Card>
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha de nacimiento
                </p>
                <p>{student.birthDate.slice(0, 10)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Docente asignado
                </p>
                <p>{student.teacher?.name ?? 'Sin asignar'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tutor(a)</p>
                <p>{student.tutorName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Teléfono del tutor(a)
                </p>
                <p>{student.tutorPhone ?? '—'}</p>
              </div>
              {student.neeDescription && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Descripción de la NEE
                  </p>
                  <p>{student.neeDescription}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">
                  Consentimiento
                </p>
                <Badge variant={student.consentSigned ? 'default' : 'outline'}>
                  {student.consentSigned
                    ? `Firmado (${student.consentDate?.slice(0, 10) ?? ''})`
                    : 'Pendiente'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calificaciones" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SUBJECT_FILTER_ALL}>
                  Todas las materias
                </SelectItem>
                {(Object.keys(SUBJECT_LABELS) as Subject[]).map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {SUBJECT_LABELS[subject]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="w-40"
              placeholder="Filtrar por periodo"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            />
          </div>

          {gradesLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Técnica</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Calificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Sin calificaciones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>
                        {grade.session?.sessionDate.slice(0, 10) ?? '—'}
                      </TableCell>
                      <TableCell>
                        {grade.session
                          ? `${grade.session.technique.name} (${TECHNIQUE_CATEGORY_LABELS[grade.session.technique.category]})`
                          : '—'}
                      </TableCell>
                      <TableCell>{SUBJECT_LABELS[grade.subject]}</TableCell>
                      <TableCell>{grade.period}</TableCell>
                      <TableCell>{Number(grade.score).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar alumno</DialogTitle>
          </DialogHeader>
          <StudentForm
            mode="edit"
            student={student}
            teachers={teachers}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
