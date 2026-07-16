import axios from 'axios'
import type { ArasaacPictogram } from '@/types'

// Cliente para la API pública de ARASAAC. Es un servicio de terceros:
// se usa un cliente separado para NO enviarle nuestro JWT.
const arasaacClient = axios.create({
  baseURL: 'https://api.arasaac.org/v1',
})

const ARASAAC_STATIC = 'https://static.arasaac.org/pictograms'

export function pictogramImageUrl(id: number, size: 300 | 500 = 300): string {
  return `${ARASAAC_STATIC}/${id}/${id}_${size}.png`
}

export async function searchPictograms(
  query: string,
  locale = 'es',
): Promise<ArasaacPictogram[]> {
  try {
    const { data } = await arasaacClient.get<ArasaacPictogram[]>(
      `/pictograms/${locale}/search/${encodeURIComponent(query)}`,
    )
    return data
  } catch (error) {
    // ARASAAC responde 404 cuando la búsqueda no tiene resultados
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []
    }
    throw error
  }
}
