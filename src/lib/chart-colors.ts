import type { TechniqueCategory } from '@/types'

// Paleta categórica para las técnicas de enseñanza (UI-13).
// Colores validados como CVD-safe (colorblind) sobre superficie clara y oscura
// con la herramienta de validación de paletas: separación CVD ΔE ≥ 13 y
// visión normal ΔE ≥ 27 entre todos los pares. El orden de asignación es fijo
// (no se cicla): cada técnica conserva SIEMPRE su color, sin importar el filtro.
//
// En claro, el magenta (Repetición) queda algo por debajo de 3:1 de contraste,
// por eso en las gráficas se acompaña SIEMPRE de leyenda + etiquetas directas de
// valor + vista de tabla, de modo que la identidad nunca depende solo del color.

export const TECHNIQUE_CHART_COLORS: Record<TechniqueCategory, string> = {
  VISUAL: '#2a78d6', // azul
  LUDICA: '#008300', // verde
  REPETICION: '#e87ba4', // magenta
  OTRA: '#eda100', // ámbar
}

// Variantes para superficie oscura (por si se habilita el modo oscuro global).
export const TECHNIQUE_CHART_COLORS_DARK: Record<TechniqueCategory, string> = {
  VISUAL: '#3987e5',
  LUDICA: '#008300',
  REPETICION: '#d55181',
  OTRA: '#c98500',
}

// Orden fijo en el que se muestran las técnicas en gráficas y leyendas.
export const TECHNIQUE_ORDER: TechniqueCategory[] = [
  'VISUAL',
  'LUDICA',
  'REPETICION',
  'OTRA',
]
