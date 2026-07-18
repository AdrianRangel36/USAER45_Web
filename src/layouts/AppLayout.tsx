import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui.store'

export function AppLayout() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          'hidden shrink-0 border-r border-sidebar-border transition-all duration-200 md:block',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        <div className="sticky top-0 h-screen">
          <Sidebar collapsed={!sidebarOpen} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
