import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  Image,
  LayoutGrid,
  Library,
  MessagesSquare,
  UserCog,
  Users,
} from 'lucide-react'
import type { Role } from '@/types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles?: Role[]
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/alumnos', label: 'Alumnos', icon: Users, roles: ['ADMIN', 'DOCENTE'] },
  { to: '/sesiones', label: 'Sesiones', icon: CalendarDays, roles: ['ADMIN', 'DOCENTE'] },
  { to: '/rubricas', label: 'Rúbricas', icon: ClipboardList, roles: ['ADMIN', 'DOCENTE'] },
  {
    to: '/entrevistas',
    label: 'Entrevistas',
    icon: MessagesSquare,
    roles: ['ADMIN', 'DOCENTE'],
  },
  { to: '/pictogramas', label: 'Pictogramas', icon: Image, roles: ['ADMIN', 'DOCENTE'] },
  {
    to: '/materiales',
    label: 'Materiales',
    icon: Library,
    roles: ['ADMIN', 'DOCENTE'],
  },
  { to: '/tablero', label: 'Tablero', icon: LayoutGrid, roles: ['ADMIN', 'DOCENTE'] },
  {
    to: '/analitica',
    label: 'Analítica',
    icon: BarChart3,
    roles: ['ADMIN', 'DIRECTIVO'],
  },
  {
    to: '/reportes',
    label: 'Reportes',
    icon: FileText,
    roles: ['ADMIN', 'DOCENTE'],
  },
  { to: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['ADMIN'] },
]
