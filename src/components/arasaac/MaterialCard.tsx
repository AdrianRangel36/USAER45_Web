import { useState } from 'react'
import { Download, Eye, ImageOff, Loader2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMaterialStore } from '@/stores/material.store'
import type { ArasaacMaterial } from '@/types'

interface MaterialCardProps {
  material: ArasaacMaterial
}

// UI-11: tarjeta de un material didáctico ARASAAC.
// Muestra miniatura, título, autor y descargas; permite vista previa (Dialog
// con las capturas) y descarga (URL directa o resuelta vía /materials/:id).
export function MaterialCard({ material }: MaterialCardProps) {
  const resolveDownloadUrl = useMaterialStore((s) => s.resolveDownloadUrl)
  const [downloading, setDownloading] = useState(false)

  const author = material.authors?.filter(Boolean).join(', ')
  const preview = material.thumbnailUrl ?? material.screenshots?.[0] ?? null
  const screenshots =
    material.screenshots && material.screenshots.length > 0
      ? material.screenshots
      : preview
        ? [preview]
        : []

  async function handleDownload() {
    try {
      setDownloading(true)
      const url =
        material.downloadUrl ?? (await resolveDownloadUrl(material.id))
      if (!url) {
        toast.error('Este material no tiene un archivo de descarga disponible.')
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('No se pudo obtener la descarga del material.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden py-0">
      <div className="flex aspect-video items-center justify-center overflow-hidden border-b border-border bg-white">
        {preview ? (
          <img
            src={preview}
            alt={material.title}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageOff className="size-8 text-muted-foreground" aria-hidden />
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium" title={material.title}>
          {material.title}
        </h3>
        {author && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <UserRound className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{author}</span>
          </p>
        )}
        {typeof material.downloads === 'number' && (
          <Badge variant="secondary" className="w-fit">
            <Download aria-hidden /> {material.downloads.toLocaleString('es-MX')}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="gap-2 p-3 pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={screenshots.length === 0}
            >
              <Eye aria-hidden /> Vista previa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{material.title}</DialogTitle>
              {material.description && (
                <DialogDescription>{material.description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="grid max-h-[70vh] gap-3 overflow-y-auto">
              {screenshots.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${material.title} — vista ${i + 1}`}
                  className="w-full rounded-md border border-border bg-white object-contain"
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          size="sm"
          className="flex-1"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Download aria-hidden />
          )}
          Descargar
        </Button>
      </CardFooter>
    </Card>
  )
}
