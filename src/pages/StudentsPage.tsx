import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStudentStore } from '@/stores/student.store'
import type { NeeType } from '@/types'

const NEE_LABELS: Record<NeeType, string> = {
  DEFICIT_ATENCION: 'Déficit de atención',
  DIFICULTAD_APRENDIZAJE: 'Dificultad de aprendizaje',
  DISCAPACIDAD_INTELECTUAL: 'Discapacidad intelectual',
  TRASTORNO_LENGUAJE: 'Trastorno del lenguaje',
  OTRO: 'Otro',
}

export function StudentsPage() {
  const { students, loading, error, fetchStudents } = useStudentStore()

  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Alumnos</h1>
        <p className="text-muted-foreground">
          Alumnos atendidos por la unidad USAER 45J
        </p>
      </div>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>NEE</TableHead>
              <TableHead>Tutor(a)</TableHead>
              <TableHead>Consentimiento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Sin alumnos registrados
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.fullName}
                  </TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{NEE_LABELS[student.neeType]}</TableCell>
                  <TableCell>{student.tutorName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={student.consentSigned ? 'default' : 'outline'}
                    >
                      {student.consentSigned ? 'Firmado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
