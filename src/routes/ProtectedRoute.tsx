import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  // Sin `roles`, basta con estar autenticado; con `roles`, el rol del
  // usuario debe estar en la lista.
  roles?: Role[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!token || !user) {
    // Se guarda la ruta original para volver a ella después del login.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/no-autorizado" replace />
  }

  return <Outlet />
}
