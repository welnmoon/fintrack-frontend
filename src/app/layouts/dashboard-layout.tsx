import { Outlet } from 'react-router-dom'
import { SidebarToggleProvider, useSidebarToggle } from '@/features/sidebar-toggle'
import { cn } from '@/shared/lib'
import { Topbar } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'

function DashboardScaffold() {
  const { isSidebarCollapsed } = useSidebarToggle()

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          'min-h-screen transition-[padding-left] duration-200 md:pl-72',
          isSidebarCollapsed && 'md:pl-24',
        )}
      >
        <Topbar />
        <main className="container py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function DashboardLayout() {
  return (
    <SidebarToggleProvider>
      <DashboardScaffold />
    </SidebarToggleProvider>
  )
}
