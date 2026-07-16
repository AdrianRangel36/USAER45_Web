import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth.store'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador(a)',
  DOCENTE: 'Docente',
  DIRECTIVO: 'Directivo(a)',
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Hola, {user?.name ?? 'usuario'}
        </h1>
        <p className="text-muted-foreground">
          Sesión iniciada como {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Alumnos</CardTitle>
            <CardDescription>
              Consulta y seguimiento de alumnos con NEE
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Registro de calificaciones y conducta por sesión.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pictogramas</CardTitle>
            <CardDescription>Búsqueda en ARASAAC</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Apoyos visuales para las sesiones de trabajo.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analítica</CardTitle>
            <CardDescription>Resultados por técnica de enseñanza</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Estadísticas generadas por el servicio de analítica.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
