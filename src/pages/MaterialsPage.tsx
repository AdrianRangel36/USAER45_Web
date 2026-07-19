import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { MaterialCard } from '@/components/arasaac/MaterialCard'
import { useMaterialStore } from '@/stores/material.store'

// UI-11: biblioteca de materiales didácticos ARASAAC.
// Mismo patrón que PictogramsPage (UI-09): buscador + grid con estados de
// carga, error y "sin resultados".
export function MaterialsPage() {
  const [term, setTerm] = useState('')
  const { query, results, loading, error, search } = useMaterialStore()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void search(term)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Materiales didácticos ARASAAC</h1>
        <p className="text-muted-foreground">
          Busca y descarga materiales didácticos para las sesiones de trabajo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-md gap-2">
        <Input
          placeholder="Ej. sumas, lectura, emociones…"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          Sin resultados para “{query}”.
        </p>
      )}

      {!loading && !query && !error && (
        <p className="text-sm text-muted-foreground">
          Escribe un término para buscar materiales didácticos.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  )
}
