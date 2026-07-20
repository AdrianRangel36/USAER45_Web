import { Document, View } from '@react-pdf/renderer'
import { SUBJECT_LABELS, TECHNIQUE_CATEGORY_LABELS } from '@/lib/labels'
import {
  formatDateShort,
  type CountStat,
  type SessionsReportPayload,
} from '@/lib/report-data'
import type { Session } from '@/types'
import {
  DataTable,
  ReportPage,
  Section,
  StatBox,
  pdfStyles,
  type PdfColumn,
} from './pdf-primitives'

// UI-14: reporte grupal de sesiones de trabajo (conteos por técnica y
// materia + detalle). Documento puro: los datos llegan en el payload.

const MAX_NOTES_LENGTH = 70

function truncate(text: string | null | undefined): string {
  if (!text) return '—'
  return text.length > MAX_NOTES_LENGTH
    ? `${text.slice(0, MAX_NOTES_LENGTH)}…`
    : text
}

const SESSION_COLUMNS: PdfColumn<Session>[] = [
  { header: 'Fecha', flex: 1.1, cell: (s) => formatDateShort(s.sessionDate) },
  { header: 'Docente', flex: 1.8, cell: (s) => s.teacher.name },
  {
    header: 'Técnica',
    flex: 2.2,
    cell: (s) =>
      `${s.technique.name} (${TECHNIQUE_CATEGORY_LABELS[s.technique.category]})`,
  },
  { header: 'Materia', flex: 1.2, cell: (s) => SUBJECT_LABELS[s.subject] },
  { header: 'Notas', flex: 2.4, cell: (s) => truncate(s.notes) },
]

const COUNT_COLUMNS: PdfColumn<CountStat>[] = [
  { header: 'Categoría', flex: 2.4, cell: (c) => c.label },
  { header: 'Sesiones', flex: 1, align: 'right', cell: (c) => String(c.count) },
  {
    header: 'Porcentaje',
    flex: 1,
    align: 'right',
    cell: (c) => `${c.percent}%`,
  },
]

export function SessionsSummaryReport({
  payload,
}: {
  payload: SessionsReportPayload
}) {
  const { sessions, stats, filters, meta } = payload
  const sortedSessions = [...sessions].sort((a, b) =>
    a.sessionDate.localeCompare(b.sessionDate),
  )

  return (
    <Document
      title="Reporte de sesiones de trabajo"
      author="Sistema USAER 45J"
      language="es"
    >
      <ReportPage
        meta={meta}
        title="Reporte de sesiones de trabajo"
        subtitle={`Materia: ${filters.subjectLabel} · Rango: ${filters.rangeLabel}`}
      >
        <Section title="Resumen general">
          <View style={pdfStyles.statRow}>
            <StatBox label="Sesiones registradas" value={String(stats.total)} />
            <StatBox
              label="Docentes involucrados"
              value={String(stats.teacherCount)}
            />
            <StatBox
              label="Primera sesión"
              value={formatDateShort(stats.firstDate)}
            />
            <StatBox
              label="Última sesión"
              value={formatDateShort(stats.lastDate)}
            />
          </View>
        </Section>

        <Section title="Sesiones por técnica de enseñanza">
          <DataTable
            columns={COUNT_COLUMNS}
            rows={stats.byTechnique}
            rowKey={(c) => c.label}
            emptyText="Sin sesiones en el filtro seleccionado"
          />
        </Section>

        <Section title="Sesiones por materia">
          <DataTable
            columns={COUNT_COLUMNS}
            rows={stats.bySubject}
            rowKey={(c) => c.label}
            emptyText="Sin sesiones en el filtro seleccionado"
          />
        </Section>

        <Section title="Detalle de sesiones">
          <DataTable
            columns={SESSION_COLUMNS}
            rows={sortedSessions}
            rowKey={(s) => s.id}
            emptyText="Sin sesiones registradas"
          />
        </Section>
      </ReportPage>
    </Document>
  )
}
