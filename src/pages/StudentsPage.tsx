import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NEE_LABELS } from '@/lib/labels'
import { useAuthStore } from '@/stores/auth.store'
import { useStudentStore } from '@/stores/student.store'

export function StudentsPage() {
  const navigate = useNavigate()
  const hasRole = useAuthStore((state) => state.hasRole)
  const { students, loading, error, fetchStudents } = useStudentStore()

  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Alumnos</h1>
          <p className="text-muted-foreground">
            Alumnos atendidos por la unidad USAER 45J
          </p>
        </div>
        {hasRole('ADMIN') && (
          <Button onClick={() => navigate('/alumnos/nuevo')}>
            Nuevo alumno
          </Button>
        )}
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
                <TableRow
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/alumnos/${student.id}`)}
                >
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
