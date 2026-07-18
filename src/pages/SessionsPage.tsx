import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { SUBJECT_LABELS, TECHNIQUE_CATEGORY_LABELS } from '@/lib/labels'
import { useSessionStore } from '@/stores/session.store'

export function SessionsPage() {
  const navigate = useNavigate()
  const { sessions, loading, error, fetchSessions } = useSessionStore()

  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Sesiones</h1>
          <p className="text-muted-foreground">
            Sesiones de enseñanza registradas por técnica
          </p>
        </div>
        <Button onClick={() => navigate('/sesiones/nueva')}>
          Nueva sesión
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
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
              <TableHead>Fecha</TableHead>
              <TableHead>Técnica</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead>Docente</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Sin sesiones registradas
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.sessionDate.slice(0, 10)}</TableCell>
                  <TableCell>
                    {session.technique.name} (
                    {TECHNIQUE_CATEGORY_LABELS[session.technique.category]})
                  </TableCell>
                  <TableCell>{SUBJECT_LABELS[session.subject]}</TableCell>
                  <TableCell>{session.teacher.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/sesiones/${session.id}/calificaciones`)
                      }
                    >
                      Calificaciones
                    </Button>
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
