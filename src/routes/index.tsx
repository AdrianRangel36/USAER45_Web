import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { GradeCapturePage } from '@/pages/GradeCapturePage'
import { InterviewFormPage } from '@/pages/InterviewFormPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PictogramsPage } from '@/pages/PictogramsPage'
import { RubricFormPage } from '@/pages/RubricFormPage'
import { SessionFormPage } from '@/pages/SessionFormPage'
import { SessionsPage } from '@/pages/SessionsPage'
import { StudentDetailPage } from '@/pages/StudentDetailPage'
import { StudentFormPage } from '@/pages/StudentFormPage'
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
          {
            // GET /students: solo ADMIN y DOCENTE (el docente ve solo los suyos)
            element: <ProtectedRoute roles={['ADMIN', 'DOCENTE']} />,
            children: [
              { path: 'alumnos', element: <StudentsPage /> },
              { path: 'alumnos/:id', element: <StudentDetailPage /> },
              {
                // POST /students: solo ADMIN
                element: <ProtectedRoute roles={['ADMIN']} />,
                children: [
                  { path: 'alumnos/nuevo', element: <StudentFormPage /> },
                ],
              },
            ],
          },
          {
            // Solo docentes y administradores
            element: <ProtectedRoute roles={['ADMIN', 'DOCENTE']} />,
            children: [{ path: 'pictogramas', element: <PictogramsPage /> }],
          },
          {
            // /sessions: solo ADMIN y DOCENTE (el docente ve solo las suyas)
            element: <ProtectedRoute roles={['ADMIN', 'DOCENTE']} />,
            children: [
              { path: 'sesiones', element: <SessionsPage /> },
              { path: 'sesiones/nueva', element: <SessionFormPage /> },
              {
                path: 'sesiones/:sessionId/calificaciones',
                element: <GradeCapturePage />,
              },
            ],
          },
          {
            // Gate de solo frontend: RubricsController no tiene @Roles en el
            // backend (cualquier usuario autenticado podría llamarlo), pero
            // se restringe aquí a ADMIN/DOCENTE para no exponer captura de
            // conducta al rol DIRECTIVO (de solo lectura).
            element: <ProtectedRoute roles={['ADMIN', 'DOCENTE']} />,
            children: [{ path: 'rubricas', element: <RubricFormPage /> }],
          },
          {
            // Gate de solo frontend: InterviewsController tampoco tiene
            // @Roles en el backend; se restringe aquí a ADMIN/DOCENTE.
            element: <ProtectedRoute roles={['ADMIN', 'DOCENTE']} />,
            children: [{ path: 'entrevistas', element: <InterviewFormPage /> }],
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
