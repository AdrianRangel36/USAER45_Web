import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TECHNIQUE_CHART_COLORS, TECHNIQUE_ORDER } from '@/lib/chart-colors'
import { SUBJECT_LABELS, TECHNIQUE_CATEGORY_LABELS } from '@/lib/labels'
import { useAnalyticsStore } from '@/stores/analytics.store'
import type { Subject, TechniqueCategory } from '@/types'

// UI-13: dashboard analítico con gráficas Recharts (por técnica y evolución).
// Consume POST /analytics/comparison (ADMIN/DIRECTIVO). El filtro de materia
// re-consulta el backend. Cada técnica conserva SIEMPRE su color; además del
// color, la identidad se refuerza con etiquetas de eje, valores directos,
// leyenda y una vista de tabla (relief rule de la validación de paleta).

type SubjectFilter = Subject | 'ALL'

const SUBJECT_TABS: { value: SubjectFilter; label: string }[] = [
  { value: 'ALL', label: 'Ambas' },
  { value: 'LECTURA', label: SUBJECT_LABELS.LECTURA },
  { value: 'MATEMATICAS', label: SUBJECT_LABELS.MATEMATICAS },
]

const TOOLTIP_STYLE = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--popover-foreground)',
  fontSize: 12,
}

function fmt(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toFixed(1)
}

function fmtP(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value < 0.001 ? '< 0.001' : value.toFixed(3)
}

function fmtStat(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toFixed(2)
}

// Leyenda manual compartida: color → técnica, en orden fijo.
function TechniqueLegend({ techniques }: { techniques: TechniqueCategory[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {techniques.map((t) => (
        <span
          key={t}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: TECHNIQUE_CHART_COLORS[t] }}
            aria-hidden
          />
          {TECHNIQUE_CATEGORY_LABELS[t]}
        </span>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const [subject, setSubject] = useState<SubjectFilter>('ALL')
  const { comparison, loadingComparison, errorComparison, fetchComparison } =
    useAnalyticsStore()

  useEffect(() => {
    void fetchComparison(subject === 'ALL' ? {} : { subject })
  }, [subject, fetchComparison])

  // Técnicas presentes, respetando el orden fijo de la paleta.
  const techniques = useMemo(() => {
    if (!comparison) return []
    return TECHNIQUE_ORDER.filter((t) =>
      comparison.byTechnique.some((row) => row.technique === t),
    )
  }, [comparison])

  const scoreData = useMemo(
    () =>
      (comparison?.byTechnique ?? []).map((row) => ({
        technique: row.technique,
        label: TECHNIQUE_CATEGORY_LABELS[row.technique],
        average: row.average,
        behaviorAverage: row.behaviorAverage,
        sessions: row.sessions,
      })),
    [comparison],
  )

  const bestTechnique =
    comparison?.bestTechnique ??
    (comparison && comparison.byTechnique.length > 0
      ? [...comparison.byTechnique]
          .filter((r) => r.average !== null)
          .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))[0]?.technique ??
        null
      : null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analítica por técnica</h1>
          <p className="text-muted-foreground">
            Comparación del rendimiento y la conducta según la técnica de
            enseñanza
          </p>
        </div>
        <Tabs
          value={subject}
          onValueChange={(v) => setSubject(v as SubjectFilter)}
        >
          <TabsList>
            {SUBJECT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {errorComparison && !loadingComparison && (
        <p className="text-sm text-destructive" role="alert">
          {errorComparison}
        </p>
      )}

      {!loadingComparison && comparison?.degraded && (
        <p className="text-sm text-muted-foreground" role="status">
          Aviso: el servicio de analítica avanzada no respondió; se muestran
          promedios calculados localmente y el análisis de significancia no
          está disponible por ahora.
        </p>
      )}

      {loadingComparison && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      )}

      {!loadingComparison &&
        comparison &&
        comparison.byTechnique.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aún no hay datos suficientes para el análisis.
          </p>
        )}

      {!loadingComparison && comparison && comparison.byTechnique.length > 0 && (
        <>
          {bestTechnique && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Técnica con mejor promedio:
              </span>
              <Badge>
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: TECHNIQUE_CHART_COLORS[bestTechnique],
                  }}
                  aria-hidden
                />
                {TECHNIQUE_CATEGORY_LABELS[bestTechnique]}
              </Badge>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Gráfica 1: promedio de calificación por técnica */}
            <Card>
              <CardHeader>
                <CardTitle>Promedio de calificación por técnica</CardTitle>
                <CardDescription>
                  Escala 0–10 ·{' '}
                  {subject === 'ALL'
                    ? 'Lectura y Matemáticas'
                    : SUBJECT_LABELS[subject]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={scoreData}
                    margin={{ top: 16, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [fmt(value as number), 'Promedio']}
                    />
                    <Bar dataKey="average" radius={[4, 4, 0, 0]} maxBarSize={72}>
                      {scoreData.map((row) => (
                        <Cell
                          key={row.technique}
                          fill={TECHNIQUE_CHART_COLORS[row.technique]}
                        />
                      ))}
                      <LabelList
                        dataKey="average"
                        position="top"
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: unknown) => fmt(value as number | null)}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfica 2: promedio conductual por técnica */}
            <Card>
              <CardHeader>
                <CardTitle>Promedio conductual por técnica</CardTitle>
                <CardDescription>
                  Escala de rúbrica 1–4 (mayor es mejor)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={scoreData}
                    margin={{ top: 16, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      domain={[0, 4]}
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [fmt(value as number), 'Conducta']}
                    />
                    <Bar
                      dataKey="behaviorAverage"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={72}
                    >
                      {scoreData.map((row) => (
                        <Cell
                          key={row.technique}
                          fill={TECHNIQUE_CHART_COLORS[row.technique]}
                        />
                      ))}
                      <LabelList
                        dataKey="behaviorAverage"
                        position="top"
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: unknown) => fmt(value as number | null)}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráfica 3: evolución del promedio por período */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución del promedio por período</CardTitle>
              <CardDescription>
                Calificación media (0–10) de cada técnica a lo largo de los
                períodos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comparison.evolution.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no hay períodos registrados para mostrar la evolución.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={comparison.evolution}
                    margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => fmt(value as number)}
                    />
                    <Legend />
                    {techniques.map((t) => (
                      <Line
                        key={t}
                        type="monotone"
                        dataKey={t}
                        name={TECHNIQUE_CATEGORY_LABELS[t]}
                        stroke={TECHNIQUE_CHART_COLORS[t]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Vista de tabla (accesibilidad: la identidad nunca depende solo del color) */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle por técnica</CardTitle>
              <CardDescription>
                Los mismos datos de las gráficas en formato de tabla
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TechniqueLegend techniques={techniques} />
              <Table className="mt-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>Técnica</TableHead>
                    <TableHead className="text-right">Promedio (0–10)</TableHead>
                    <TableHead className="text-right">Conducta (1–4)</TableHead>
                    <TableHead className="text-right">Sesiones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoreData.map((row) => (
                    <TableRow key={row.technique}>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                TECHNIQUE_CHART_COLORS[row.technique],
                            }}
                            aria-hidden
                          />
                          {row.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmt(row.average)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmt(row.behaviorAverage)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.sessions.toLocaleString('es-MX')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ANL-08: significancia estadística (ANOVA + t-tests de Welch vía analytics-service) */}
          <Card>
            <CardHeader>
              <CardTitle>Significancia estadística</CardTitle>
              <CardDescription>
                ANOVA de un factor y pruebas t de Welch pareadas entre Visual,
                Lúdica y Repetición
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {comparison.statisticalAnalysis === null ? (
                <p className="text-sm text-muted-foreground">
                  El servicio de analítica no está disponible en este momento;
                  no se puede calcular la significancia estadística.
                </p>
              ) : (
                comparison.statisticalAnalysis.map((sa) => (
                  <div key={sa.subject} className="space-y-3">
                    {comparison.subject === 'ALL' && (
                      <h3 className="text-sm font-medium">
                        {SUBJECT_LABELS[sa.subject]}
                      </h3>
                    )}

                    {!sa.sufficientData ? (
                      <p className="text-sm text-muted-foreground">
                        Datos insuficientes para la prueba estadística (se
                        requieren al menos 2 registros en al menos 2 técnicas).
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted-foreground">ANOVA:</span>
                          <span className="tabular-nums">
                            F = {fmtStat(sa.anova?.fStatistic)}, p ={' '}
                            {fmtP(sa.anova?.pValue)}
                          </span>
                          <Badge
                            variant={
                              sa.anova?.significant ? 'default' : 'outline'
                            }
                          >
                            {sa.anova?.significant
                              ? 'Significativo'
                              : 'No significativo'}
                          </Badge>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Comparación</TableHead>
                              <TableHead className="text-right">n</TableHead>
                              <TableHead className="text-right">t</TableHead>
                              <TableHead className="text-right">p</TableHead>
                              <TableHead className="text-right">
                                ¿Significativo?
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sa.pairwiseTTests.map((t) => (
                              <TableRow key={`${t.techniqueA}-${t.techniqueB}`}>
                                <TableCell>
                                  {TECHNIQUE_CATEGORY_LABELS[t.techniqueA]} vs.{' '}
                                  {TECHNIQUE_CATEGORY_LABELS[t.techniqueB]}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {t.nA} / {t.nB}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {fmtStat(t.tStatistic)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {fmtP(t.pValue)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={
                                      t.significant ? 'default' : 'outline'
                                    }
                                  >
                                    {t.significant ? 'Sí' : 'No'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
