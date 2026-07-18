import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useArasaacStore } from '@/stores/arasaac.store'
import type { ArasaacPictogram } from '@/types'
import { PictogramCard } from './PictogramCard'

interface PictogramPickerProps {
  selected: ArasaacPictogram[]
  onChange: (selected: ArasaacPictogram[]) => void
}

// Buscador + selección local de pictogramas como apoyo visual de consulta
// durante la sesión. USAER45_Back no tiene ningún endpoint para asociar
// pictogramas a una sesión (SessionPictogram no tiene controlador), así que
// esta selección es solo de referencia para el docente y no se envía al
// crear la sesión.
export function PictogramPicker({ selected, onChange }: PictogramPickerProps) {
  const [term, setTerm] = useState('')
  const { query, results, loading, error, search } = useArasaacStore()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void search(term)
  }

  function toggle(pictogram: ArasaacPictogram) {
    const exists = selected.some((p) => p.id === pictogram.id)
    onChange(
      exists
        ? selected.filter((p) => p.id !== pictogram.id)
        : [...selected, pictogram],
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Busca y marca pictogramas como apoyo visual de consulta para la
        sesión. Esta selección no se guarda al enviar el formulario.
      </p>

      <form onSubmit={handleSubmit} className="flex max-w-md gap-2">
        <Input
          placeholder="Ej. casa, comer, leer…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          Buscar
        </Button>
      </form>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          Sin resultados para “{query}”.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {results.map((pictogram) => (
            <PictogramCard
              key={pictogram.id}
              pictogram={pictogram}
              selected={selected.some((p) => p.id === pictogram.id)}
              onSelect={toggle}
            />
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            Seleccionados ({selected.length})
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {selected.map((pictogram) => (
              <PictogramCard
                key={pictogram.id}
                pictogram={pictogram}
                selected
                onSelect={toggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
