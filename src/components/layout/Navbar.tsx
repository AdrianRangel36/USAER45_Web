import { useState } from 'react'
import { Menu, Moon, PanelLeft, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUiStore } from '@/stores/ui.store'
import { Sidebar } from './Sidebar'
import { UserMenu } from './UserMenu'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
          <span className="sr-only">Abrir menú</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden md:inline-flex"
          onClick={toggleSidebar}
        >
          <PanelLeft />
          <span className="sr-only">Colapsar barra lateral</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
          {theme === 'light' ? <Moon /> : <Sun />}
          <span className="sr-only">Cambiar tema</span>
        </Button>
        <UserMenu />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
