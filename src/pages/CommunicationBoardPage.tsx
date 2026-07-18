import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoorOpen, Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { BoardPictogram } from '@/components/arasaac/BoardPictogram'
import {
  PhraseBuilder,
  type PhraseItem,
} from '@/components/arasaac/PhraseBuilder'
import {
  BG_CLASSES,
  BOARD_CATEGORIES,
  SIZE_CLASSES,
  SKIN_OPTIONS,
  type BoardBackground,
  type BoardSize,
} from '@/components/arasaac/board-config'
import { api, getApiErrorMessage } from '@/lib/api'
import { speak, stopSpeaking } from '@/lib/speech'
import { cn } from '@/lib/utils'
import type { ArasaacPictogram, ArasaacSkin } from '@/types'

// UI-10: tablero de comunicación a pantalla completa. Vive FUERA de AppLayout
// (sin sidebar/navbar) y usa estado local: no toca useArasaacStore para no
// pisar la búsqueda de PictogramsPage/PictogramPicker.

const MAX_PICTOGRAMS = 24 // tablero acotado: pocos objetivos, grandes

const canFullscreen =
  typeof document !== 'undefined' &&
  Boolean(document.documentElement.requestFullscreen)

export function CommunicationBoardPage() {
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState(BOARD_CATEGORIES[0].id)
  const [skin, setSkin] = useState<ArasaacSkin | 'default'>('default')
  const [size, setSize] = useState<BoardSize>('lg')
  const [background, setBackground] = useState<BoardBackground>('normal')
  const [phrase, setPhrase] = useState<PhraseItem[]>([])
  const [results, setResults] = useState<ArasaacPictogram[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const category =
    BOARD_CATEGORIES.find((c) => c.id === categoryId) ?? BOARD_CATEGORIES[0]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .get<ArasaacPictogram[]>('/arasaac/search', {
        params:
          skin === 'default'
            ? { term: category.term }
            : { term: category.term, skin },
      })
      .then(({ data }) => {
        if (!cancelled) setResults(data.slice(0, MAX_PICTOGRAMS))
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category.term, skin])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function handleSelect(pictogram: ArasaacPictogram) {
    const word = pictogram.keywords[0] ?? String(pictogram.id)
    speak(word)
    setPhrase((prev) => [
      ...prev,
      { uid: crypto.randomUUID(), pictogram, word },
    ])
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  }

  async function handleExit() {
    stopSpeaking()
    if (document.fullscreenElement) await document.exitFullscreen()
    navigate('/')
  }

  return (
    <div
      className={cn(
        'flex h-svh flex-col overflow-hidden',
        BG_CLASSES[background].root,
      )}
    >
      {/* Fila 1: frase + pantalla completa + salir */}
      <header className="flex items-start gap-2 border-b border-border p-2">
        <PhraseBuilder
          items={phrase}
          onRemove={(uid) =>
            setPhrase((prev) => prev.filter((i) => i.uid !== uid))
          }
          onClear={() => setPhrase([])}
          onSpeakAll={() => speak(phrase.map((i) => i.word).join(' '))}
        />
        {canFullscreen && (
          <Button
            variant="outline"
            size="icon-lg"
            className={BG_CLASSES[background].outlineBtn}
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={
              isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
            }
          >
            {isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
        )}
        <Button variant="destructive" size="lg" onClick={handleExit}>
          <DoorOpen /> Salir
        </Button>
      </header>

      {/* Fila 2: categorías */}
      <nav aria-label="Categorías" className="flex gap-2 overflow-x-auto p-2">
        {BOARD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={cat.id === categoryId}
            onClick={() => setCategoryId(cat.id)}
            className={cn(
              'min-h-14 shrink-0 rounded-xl border-2 px-6 text-lg font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              cat.id === categoryId
                ? 'border-primary bg-primary text-primary-foreground'
                : cn('border-border', BG_CLASSES[background].chip),
            )}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Fila 3: opciones (piel, tamaño, fondo) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-2 pb-2">
        <Select
          value={skin}
          onValueChange={(value) => setSkin(value as ArasaacSkin | 'default')}
        >
          <SelectTrigger className="h-12 w-48 text-base" aria-label="Color de piel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SKIN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="lg"
          className={BG_CLASSES[background].outlineBtn}
          aria-pressed={size === 'lg'}
          onClick={() => setSize(size === 'lg' ? 'md' : 'lg')}
        >
          {size === 'lg' ? 'Tamaño: grande' : 'Tamaño: mediano'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className={BG_CLASSES[background].outlineBtn}
          aria-pressed={background === 'contraste'}
          onClick={() =>
            setBackground(background === 'normal' ? 'contraste' : 'normal')
          }
        >
          {background === 'normal' ? 'Fondo: normal' : 'Fondo: alto contraste'}
        </Button>
      </div>

      {/* Cuadrícula */}
      <main className="flex-1 overflow-y-auto p-3">
        {error && (
          <p role="alert" className="text-lg text-destructive">
            {error}
          </p>
        )}
        <div className={cn('grid gap-3', SIZE_CLASSES[size])}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl" />
              ))
            : results.map((pictogram) => (
                <BoardPictogram
                  key={pictogram.id}
                  pictogram={pictogram}
                  onSelect={handleSelect}
                />
              ))}
        </div>
      </main>
    </div>
  )
}
