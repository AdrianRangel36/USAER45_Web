import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

// Cliente HTTP para el backend NestJS (USAER45_Back).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// FE-03: inyecta el JWT en el header Authorization de cada petición.
// El token se lee del store en el momento de la petición (no al crear el
// cliente) para que siempre refleje la sesión vigente.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el backend responde 401 con una sesión activa, el token expiró o fue
// revocado: se cierra la sesión para que ProtectedRoute redirija a /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      useAuthStore.getState().token
    ) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

// Extrae el mensaje de error que envía la API de NestJS
// ({ message: string | string[] }) o devuelve un mensaje genérico.
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
    if (!error.response) return 'No se pudo conectar con el servidor'
  }
  return 'Ocurrió un error inesperado'
}
