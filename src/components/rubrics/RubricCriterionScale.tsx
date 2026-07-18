import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RubricCriterion } from '@/types'

interface RubricCriterionScaleProps {
  criterion: RubricCriterion
  value: number | undefined
  onChange: (value: number) => void
}

export function RubricCriterionScale({
  criterion,
  value,
  onChange,
}: RubricCriterionScaleProps) {
  const scale =
    typeof criterion.escala === 'object' ? criterion.escala : null

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div>
        <Label>{criterion.nombre}</Label>
        <p className="text-xs text-muted-foreground">
          {criterion.descripcion}
        </p>
      </div>

      {scale ? (
        <Select
          value={value !== undefined ? String(value) : undefined}
          onValueChange={(v) => onChange(Number(v))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un nivel" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(scale.etiquetas).map(([level, label]) => (
              <SelectItem key={level} value={level}>
                {level} · {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="number"
          min={1}
          max={4}
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </div>
  )
}
