import { Document, View } from '@react-pdf/renderer'
import {
  NEE_LABELS,
  SUBJECT_LABELS,
  TECHNIQUE_CATEGORY_LABELS,
} from '@/lib/labels'
import {
  formatDateShort,
  formatScore,
  type StudentReportPayload,
  type SubjectAverage,
  type TechniqueStat,
} from '@/lib/report-data'
import type { GradeRecord } from '@/types'
import {
  DataTable,
  Field,
  ReportPage,
  Section,
  SignatureRow,
  StatBox,
  pdfStyles,
  type PdfColumn,
} from './pdf-primitives'

// UI-14: reporte de progreso individual del alumno. Documento puro: todo el
// cálculo llega resuelto en el payload (ver lib/report-data.ts).

const GRADE_COLUMNS: PdfColumn<GradeRecord>[] = [
  {
    header: 'Fecha',
    flex: 1.2,
    cell: (g) => formatDateShort(g.session?.sessionDate),
  },
  {
    header: 'Técnica',
    flex: 2.6,
    cell: (g) =>
      g.session
        ? `${g.session.technique.name} (${TECHNIQUE_CATEGORY_LABELS[g.session.technique.category]})`
        : '—',
  },
  { header: 'Materia', flex: 1.4, cell: (g) => SUBJECT_LABELS[g.subject] },
  { header: 'Periodo', flex: 1.2, cell: (g) => g.period },
  {
    header: 'Calif.',
    flex: 0.8,
    align: 'right',
    cell: (g) => Number(g.score).toFixed(2),
  },
]

const TECHNIQUE_COLUMNS: PdfColumn<TechniqueStat>[] = [
  { header: 'Técnica', flex: 2.6, cell: (t) => t.name },
  {
    header: 'Categoría',
    flex: 1.4,
    cell: (t) => TECHNIQUE_CATEGORY_LABELS[t.category],
  },
  {
    header: 'Registros',
    flex: 1,
    align: 'right',
    cell: (t) => String(t.count),
  },
  {
    header: 'Promedio',
    flex: 1,
    align: 'right',
    cell: (t) => formatScore(t.average),
  },
]

const SUBJECT_COLUMNS: PdfColumn<SubjectAverage>[] = [
  { header: 'Materia', flex: 2, cell: (s) => SUBJECT_LABELS[s.subject] },
  {
    header: 'Registros',
    flex: 1,
    align: 'right',
    cell: (s) => String(s.count),
  },
  {
    header: 'Promedio',
    flex: 1,
    align: 'right',
    cell: (s) => formatScore(s.average),
  },
]

export function StudentProgressReport({
  payload,
}: {
  payload: StudentReportPayload
}) {
  const { student, grades, stats, filters, meta } = payload
  const sortedGrades = [...grades].sort((a, b) =>
    (a.session?.sessionDate ?? '').localeCompare(b.session?.sessionDate ?? ''),
  )

  return (
    <Document
      title={`Reporte de progreso — ${student.fullName}`}
      author="Sistema USAER 45J"
      language="es"
    >
      <ReportPage
        meta={meta}
        title="Reporte de progreso del alumno"
        subtitle={`Materia: ${filters.subjectLabel} · Periodo: ${filters.periodLabel}`}
      >
        <Section title="Datos del alumno">
          <View style={pdfStyles.fieldGrid}>
            <Field label="Nombre completo" value={student.fullName} />
            <Field label="Grado" value={student.grade} />
            <Field
              label="Fecha de nacimiento"
              value={formatDateShort(student.birthDate)}
            />
            <Field
              label="Necesidad educativa especial"
              value={NEE_LABELS[student.neeType]}
            />
            <Field
              label="Docente de USAER"
              value={student.teacher?.name ?? 'Sin asignar'}
            />
            <Field label="Tutor(a)" value={student.tutorName} />
            {student.neeDescription ? (
              <Field
                label="Descripción de la NEE"
                value={student.neeDescription}
                wide
              />
            ) : null}
          </View>
        </Section>

        <Section title="Resumen del desempeño">
          <View style={pdfStyles.statRow}>
            <StatBox
              label="Promedio general (0–10)"
              value={formatScore(stats.overallAverage)}
            />
            <StatBox
              label="Calificaciones registradas"
              value={String(stats.totalRecords)}
            />
            <StatBox
              label="Periodos evaluados"
              value={
                stats.periods.length > 0 ? stats.periods.join(', ') : '—'
              }
            />
            <StatBox
              label="Técnica con mejor resultado"
              value={stats.bestTechnique?.name ?? '—'}
            />
          </View>
        </Section>

        <Section title="Promedio por materia">
          <DataTable
            columns={SUBJECT_COLUMNS}
            rows={stats.bySubject}
            rowKey={(s) => s.subject}
            emptyText="Sin calificaciones en el filtro seleccionado"
          />
        </Section>

        <Section title="Desempeño por técnica de enseñanza">
          <DataTable
            columns={TECHNIQUE_COLUMNS}
            rows={stats.byTechnique}
            rowKey={(t) => t.name}
            emptyText="Sin sesiones asociadas a las calificaciones"
          />
        </Section>

        <Section title="Historial de calificaciones">
          <DataTable
            columns={GRADE_COLUMNS}
            rows={sortedGrades}
            rowKey={(g) => g.id}
            emptyText="Sin calificaciones registradas"
          />
        </Section>

        <SignatureRow
          labels={[
            'Docente de USAER',
            'Dirección de la escuela',
            'Padre, madre o tutor(a)',
          ]}
        />
      </ReportPage>
    </Document>
  )
}
