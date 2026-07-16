import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PictogramsPage } from '@/pages/PictogramsPage'
import { StudentsPage } from '@/pages/StudentsPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { UsersPage } from '@/pages/UsersPage'
import { ProtectedRoute } from './ProtectedRoute'

// FE-04: rutas de la aplicación. Las secciones sensibles se anidan bajo
// ProtectedRoute con la lista de roles permitidos (ver USAER45_Back:
// /users exige rol ADMIN, por ejemplo).
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/no-autorizado',
    element: <UnauthorizedPage />,
  },
  {
    // Cualquier usuario autenticado
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'alumnos', element: <StudentsPage /> },
          {
            // Solo docentes y administradores
            element: <ProtectedRoute roles={['ADMIN', 'DOCENTE']} />,
            children: [{ path: 'pictogramas', element: <PictogramsPage /> }],
          },
          {
            // Solo administradores
            element: <ProtectedRoute roles={['ADMIN']} />,
            children: [{ path: 'usuarios', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
