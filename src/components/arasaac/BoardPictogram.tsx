import { cn } from '@/lib/utils'
import type { ArasaacPictogram } from '@/types'

interface BoardPictogramProps {
  pictogram: ArasaacPictogram
  onSelect: (pictogram: ArasaacPictogram) => void
}

// Celda del tablero: botón nativo grande (objetivo táctil amplio) que
// pronuncia la palabra y la agrega a la frase al tocarlo.
export function BoardPictogram({ pictogram, onSelect }: BoardPictogramProps) {
  const word = pictogram.keywords[0] ?? String(pictogram.id)
  return (
    <button
      type="button"
      onClick={() => onSelect(pictogram)}
      aria-label={`Decir ${word}`}
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl border-2 border-border bg-white p-2',
        'transition-transform hover:border-primary active:scale-95',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
      )}
    >
      <img
        src={pictogram.imageUrl}
        alt=""
        loading="lazy"
        className="aspect-square w-full rounded-md object-contain"
      />
      <span className="w-full truncate text-center text-lg font-semibold capitalize text-zinc-900">
        {word}
      </span>
    </button>
  )
}
