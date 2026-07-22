import { useEffect } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TECHNIQUE_CHART_COLORS, TECHNIQUE_ORDER } from '@/lib/chart-colors'
import {
  ROLE_LABELS,
  SUBJECT_LABELS,
  TECHNIQUE_CATEGORY_LABELS,
} from '@/lib/labels'
import { useAnalyticsStore } from '@/stores/analytics.store'
import { useAuthStore } from '@/stores/auth.store'

// UI-12: dashboard con métricas generales.
// Consume GET /analytics/summary (permitido a todos los roles) y muestra los
// totales del sistema más dos desgloses (por materia y por técnica).

interface StatTileProps {
  label: string
  value: number
  icon: LucideIcon
}

function StatTile({ label, value, icon: Icon }: StatTileProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums">
          {value.toLocaleString('es-MX')}
        </p>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { summary, loadingSummary, errorSummary, fetchSummary } =
    useAnalyticsStore()

  useEffect(() => {
    void fetchSummary()
  }, [fetchSummary])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img
          src="/usaer_icon.jpeg"
          alt=""
          className="size-12 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
        />
        <div>
          <h1 className="text-2xl font-semibold">
            Hola, {user?.name ?? 'usuario'}
          </h1>
          <p className="text-muted-foreground">
            Sesión iniciada como {user ? ROLE_LABELS[user.role] : ''}
          </p>
        </div>
      </div>

      {errorSummary && !loadingSummary && (
        <p className="text-sm text-destructive" role="alert">
          {errorSummary}
        </p>
      )}

      {loadingSummary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!loadingSummary && summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatTile
              label="Alumnos"
              value={summary.totals.students}
              icon={Users}
            />
            <StatTile
              label="Sesiones"
              value={summary.totals.sessions}
              icon={CalendarDays}
            />
            <StatTile
              label="Calificaciones"
              value={summary.totals.grades}
              icon={GraduationCap}
            />
            <StatTile
              label="Registros de conducta"
              value={summary.totals.behavioralRecords}
              icon={ClipboardList}
            />
            <StatTile
              label="Técnicas"
              value={summary.totals.techniques}
              icon={BookOpenCheck}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Promedio por materia</CardTitle>
                <CardDescription>
                  Calificación media (0–10) registrada por materia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {summary.gradesBySubject.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay calificaciones registradas.
                  </p>
                ) : (
                  summary.gradesBySubject.map((row) => (
                    <div
                      key={row.subject}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{SUBJECT_LABELS[row.subject]}</span>
                      <span className="font-medium tabular-nums">
                        {row.average === null ? '—' : row.average.toFixed(1)}{' '}
                        <span className="text-muted-foreground">
                          ({row.count.toLocaleString('es-MX')})
                        </span>
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sesiones por técnica</CardTitle>
                <CardDescription>
                  Cantidad de sesiones registradas con cada técnica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {summary.sessionsByTechnique.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay sesiones registradas.
                  </p>
                ) : (
                  TECHNIQUE_ORDER.filter((t) =>
                    summary.sessionsByTechnique.some((s) => s.technique === t),
                  ).map((technique) => {
                    const row = summary.sessionsByTechnique.find(
                      (s) => s.technique === technique,
                    )
                    return (
                      <div
                        key={technique}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                TECHNIQUE_CHART_COLORS[technique],
                            }}
                            aria-hidden
                          />
                          {TECHNIQUE_CATEGORY_LABELS[technique]}
                        </span>
                        <span className="font-medium tabular-nums">
                          {(row?.count ?? 0).toLocaleString('es-MX')}
                        </span>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
