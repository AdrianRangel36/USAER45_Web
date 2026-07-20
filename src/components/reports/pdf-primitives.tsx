import { Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { formatDateLong, type ReportMeta } from '@/lib/report-data'

// UI-14: primitivas compartidas por todos los documentos PDF del sistema.
// Paleta pensada para impresión: texto casi negro, acentos en gris pizarra
// y fondos muy claros que no gastan tinta. Tipografía Helvetica (fuente
// estándar de PDF): no requiere descargar ni incrustar archivos de fuente.

const palette = {
  text: '#1a1a1a',
  muted: '#555555',
  faint: '#8a8a8a',
  accent: '#334155',
  border: '#d4d4d4',
  headerBg: '#eef1f5',
  zebra: '#f7f8fa',
}

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: palette.text,
    paddingTop: 36,
    paddingHorizontal: 40,
    paddingBottom: 56,
  },
  // Encabezado institucional
  headerBar: {
    borderBottomWidth: 2,
    borderBottomColor: palette.accent,
    paddingBottom: 10,
    marginBottom: 14,
  },
  headerInstitution: {
    fontSize: 8,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: palette.accent,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 9,
    color: palette.muted,
    marginTop: 2,
  },
  // Secciones
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: palette.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    borderBottomWidth: 0.75,
    borderBottomColor: palette.border,
    paddingBottom: 3,
    marginBottom: 6,
  },
  // Rejilla de campos etiqueta/valor
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '50%', marginBottom: 5, paddingRight: 8 },
  fieldWide: { width: '100%', marginBottom: 5 },
  fieldLabel: { fontSize: 7.5, color: palette.faint, marginBottom: 1 },
  fieldValue: { fontSize: 9.5 },
  // Tarjetas de estadísticas
  statRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: palette.headerBg,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: palette.accent,
  },
  statLabel: { fontSize: 7.5, color: palette.muted, marginTop: 2 },
  // Tabla genérica
  table: {
    borderWidth: 0.75,
    borderColor: palette.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: palette.border,
    minHeight: 16,
    alignItems: 'center',
  },
  tableHeaderRow: { backgroundColor: palette.headerBg, borderBottomWidth: 0.75 },
  tableZebraRow: { backgroundColor: palette.zebra },
  tableLastRow: { borderBottomWidth: 0 },
  tableCell: { paddingVertical: 3.5, paddingHorizontal: 6, fontSize: 8.5 },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Firmas
  signatureRow: { flexDirection: 'row', gap: 24, marginTop: 36 },
  signatureBox: { flex: 1, alignItems: 'center' },
  signatureLine: {
    borderTopWidth: 0.75,
    borderTopColor: palette.text,
    width: '100%',
    marginBottom: 3,
  },
  signatureLabel: { fontSize: 8, color: palette.muted },
  // Pie de página
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: palette.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 7.5, color: palette.faint },
  emptyText: { fontSize: 9, color: palette.muted, fontFamily: 'Helvetica-Oblique' },
})

export function ReportHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <View style={pdfStyles.headerBar} fixed>
      <Text style={pdfStyles.headerInstitution}>
        USAER 45J · Primaria «Niños Héroes» · Santiago Papasquiaro, Durango
      </Text>
      <Text style={pdfStyles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={pdfStyles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  )
}

export function ReportFooter({ meta }: { meta: ReportMeta }) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={pdfStyles.footerText}>
        Generado por {meta.generatedByName} el{' '}
        {formatDateLong(meta.generatedAtISO)} · Sistema USAER 45J
      </Text>
      <Text
        style={pdfStyles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  )
}

export function ReportPage({
  meta,
  title,
  subtitle,
  children,
}: {
  meta: ReportMeta
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <Page size="A4" style={pdfStyles.page} wrap>
      <ReportHeader title={title} subtitle={subtitle} />
      {children}
      <ReportFooter meta={meta} />
    </Page>
  )
}

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

export function Field({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <View style={wide ? pdfStyles.fieldWide : pdfStyles.field}>
      <Text style={pdfStyles.fieldLabel}>{label}</Text>
      <Text style={pdfStyles.fieldValue}>{value}</Text>
    </View>
  )
}

export function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={pdfStyles.statBox}>
      <Text style={pdfStyles.statValue}>{value}</Text>
      <Text style={pdfStyles.statLabel}>{label}</Text>
    </View>
  )
}

export interface PdfColumn<T> {
  header: string
  flex: number
  align?: 'left' | 'right' | 'center'
  cell: (row: T) => string
}

// Tabla genérica basada en flexbox. Repite el encabezado al saltar de página
// (fixed) y aplica rayado cebra para lectura en tablas largas.
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = 'Sin registros',
}: {
  columns: PdfColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyText?: string
}) {
  if (rows.length === 0) {
    return <Text style={pdfStyles.emptyText}>{emptyText}</Text>
  }

  return (
    <View style={pdfStyles.table}>
      <View style={[pdfStyles.tableRow, pdfStyles.tableHeaderRow]} fixed>
        {columns.map((col) => (
          <Text
            key={col.header}
            style={[
              pdfStyles.tableCell,
              pdfStyles.tableHeaderCell,
              { flex: col.flex, textAlign: col.align ?? 'left' },
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View
          key={rowKey(row)}
          style={[
            pdfStyles.tableRow,
            ...(index % 2 === 1 ? [pdfStyles.tableZebraRow] : []),
            ...(index === rows.length - 1 ? [pdfStyles.tableLastRow] : []),
          ]}
          wrap={false}
        >
          {columns.map((col) => (
            <Text
              key={col.header}
              style={[
                pdfStyles.tableCell,
                { flex: col.flex, textAlign: col.align ?? 'left' },
              ]}
            >
              {col.cell(row)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

export function SignatureRow({ labels }: { labels: string[] }) {
  return (
    <View style={pdfStyles.signatureRow} wrap={false}>
      {labels.map((label) => (
        <View key={label} style={pdfStyles.signatureBox}>
          <View style={pdfStyles.signatureLine} />
          <Text style={pdfStyles.signatureLabel}>{label}</Text>
        </View>
      ))}
    </View>
  )
}
