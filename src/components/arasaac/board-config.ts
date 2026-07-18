import type { ArasaacSkin } from '@/types'

// Configuración del tablero de comunicación (UI-10).

export interface BoardCategory {
  id: string
  label: string
  term: string // término real de búsqueda en ARASAAC (verificado con resultados)
}

export const BOARD_CATEGORIES: BoardCategory[] = [
  { id: 'emociones', label: 'Emociones', term: 'emociones' },
  { id: 'acciones', label: 'Acciones', term: 'acciones' },
  { id: 'numeros', label: 'Números', term: 'números' },
  { id: 'colores', label: 'Colores', term: 'colores' },
  { id: 'lectura', label: 'Lectura', term: 'lectura' },
  { id: 'matematicas', label: 'Matemáticas', term: 'matemáticas' },
]

export const SKIN_OPTIONS: { value: ArasaacSkin | 'default'; label: string }[] = [
  { value: 'default', label: 'Piel: por defecto' },
  { value: 'white', label: 'Piel clara' },
  { value: 'black', label: 'Piel oscura' },
  { value: 'assian', label: 'Piel asiática' },
  { value: 'mulatto', label: 'Piel media' },
  { value: 'aztec', label: 'Piel morena' },
]

export type BoardSize = 'lg' | 'md'

export const SIZE_CLASSES: Record<BoardSize, string> = {
  lg: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4',
  md: 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-6',
}

export type BoardBackground = 'normal' | 'contraste'

// `outlineBtn` corrige los botones variant="outline" en modo alto contraste:
// su fondo por defecto (bg-background) queda ilegible sobre el negro.
export const BG_CLASSES: Record<
  BoardBackground,
  { root: string; chip: string; outlineBtn: string }
> = {
  normal: {
    root: 'bg-background text-foreground',
    chip: 'bg-card text-card-foreground',
    outlineBtn: '',
  },
  contraste: {
    root: 'bg-zinc-950 text-zinc-50',
    chip: 'bg-zinc-900 text-zinc-50',
    outlineBtn:
      'border-zinc-600 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 hover:text-zinc-50',
  },
}
