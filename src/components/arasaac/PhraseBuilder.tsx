import { Trash2, Volume2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ArasaacPictogram } from '@/types'

export interface PhraseItem {
  uid: string // único por adición: el mismo pictograma puede repetirse en la frase
  pictogram: ArasaacPictogram
  word: string
}

interface PhraseBuilderProps {
  items: PhraseItem[]
  onRemove: (uid: string) => void
  onClear: () => void
  onSpeakAll: () => void
}

// Tira de frase (UI-10): cada pictograma tocado se agrega aquí; tocar un
// elemento lo quita; "Leer frase" pronuncia todas las palabras en orden.
export function PhraseBuilder({
  items,
  onRemove,
  onClear,
  onSpeakAll,
}: PhraseBuilderProps) {
  return (
    <div className="flex min-h-16 flex-1 items-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/50 p-1.5">
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        {items.length === 0 && (
          <span className="px-2 text-base text-muted-foreground">
            Toca pictogramas para formar una frase…
          </span>
        )}
        {items.map((item) => (
          <button
            key={item.uid}
            type="button"
            onClick={() => onRemove(item.uid)}
            aria-label={`Quitar “${item.word}” de la frase`}
            className="group flex shrink-0 items-center gap-1 rounded-lg border bg-white p-1 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <img
              src={item.pictogram.imageUrl}
              alt=""
              className="size-10 object-contain"
            />
            <span className="max-w-24 truncate text-sm font-medium text-zinc-900">
              {item.word}
            </span>
            <X
              aria-hidden
              className="size-3.5 text-muted-foreground group-hover:text-destructive"
            />
          </button>
        ))}
      </div>
      <Button
        size="lg"
        onClick={onSpeakAll}
        disabled={items.length === 0}
        aria-label="Leer la frase en voz alta"
      >
        <Volume2 /> Leer frase
      </Button>
      <Button
        variant="outline"
        size="icon-lg"
        onClick={onClear}
        disabled={items.length === 0}
        aria-label="Borrar la frase"
      >
        <Trash2 />
      </Button>
    </div>
  )
}
