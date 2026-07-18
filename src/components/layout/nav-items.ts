import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  ClipboardList,
  Home,
  Image,
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
  { to: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['ADMIN'] },
]
