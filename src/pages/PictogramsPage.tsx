import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { pictogramImageUrl } from '@/lib/arasaac'
import { useArasaacStore } from '@/stores/arasaac.store'

export function PictogramsPage() {
  const [term, setTerm] = useState('')
  const { query, results, loading, error, search } = useArasaacStore()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void search(term)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Pictogramas ARASAAC</h1>
        <p className="text-muted-foreground">
          Busca apoyos visuales para las sesiones de trabajo
        </p>
      </div>

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
            <Card key={pictogram._id} className="overflow-hidden py-0">
              <CardContent className="p-2">
                <img
                  src={pictogramImageUrl(pictogram._id)}
                  alt={pictogram.keywords[0]?.keyword ?? 'Pictograma'}
                  loading="lazy"
                  className="aspect-square w-full rounded-md bg-white object-contain"
                />
                <p className="mt-1 truncate text-center text-sm">
                  {pictogram.keywords[0]?.keyword ?? pictogram._id}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
