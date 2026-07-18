import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Student } from '@/types'

interface GradeCaptureTableProps {
  students: Student[]
  scores: Record<string, string>
  onScoreChange: (studentId: string, value: string) => void
}

export function GradeCaptureTable({
  students,
  scores,
  onScoreChange,
}: GradeCaptureTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Alumno</TableHead>
          <TableHead className="w-32">Calificación</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={2}
              className="text-center text-muted-foreground"
            >
              Sin alumnos disponibles
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.fullName}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.01}
                  value={scores[student.id] ?? ''}
                  onChange={(e) => onScoreChange(student.id, e.target.value)}
                  className="w-24"
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
