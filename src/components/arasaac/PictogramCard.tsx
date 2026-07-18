import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ArasaacPictogram } from '@/types'

interface PictogramCardProps {
  pictogram: ArasaacPictogram
  selected?: boolean
  onSelect?: (pictogram: ArasaacPictogram) => void
}

export function PictogramCard({ pictogram, selected, onSelect }: PictogramCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden py-0',
        onSelect && 'cursor-pointer transition-colors hover:border-primary',
        selected && 'border-primary ring-2 ring-primary/40',
      )}
      onClick={onSelect ? () => onSelect(pictogram) : undefined}
    >
      <CardContent className="p-2">
        <img
          src={pictogram.imageUrl}
          alt={pictogram.keywords[0] ?? 'Pictograma'}
          loading="lazy"
          className="aspect-square w-full rounded-md bg-white object-contain"
        />
        <p className="mt-1 truncate text-center text-sm">
          {pictogram.keywords[0] ?? pictogram.id}
        </p>
      </CardContent>
    </Card>
  )
}
