import { useLocation } from 'react-router-dom'
import { useSidebarToggle } from '@/features/sidebar-toggle'
import { FintrackLogo } from '@/shared/assets/fintrack-logo'
import { Separator, Sheet, SheetContent, SheetTitle } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { SidebarNav } from '@/widgets/sidebar/sidebar-nav'

export function Sidebar() {
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen } = useSidebarToggle()
  const { pathname } = useLocation()

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r bg-card px-3 py-4 md:block',
          isSidebarCollapsed ? 'w-24' : 'w-72',
        )}
      >
        <div className="flex h-full flex-col">
          <div className={cn('px-2', isSidebarCollapsed && 'flex justify-center')}>
            <FintrackLogo />
          </div>
          <Separator className="my-4" />
          <SidebarNav isCollapsed={isSidebarCollapsed} />
          <p className={cn('mt-auto px-3 pt-5 text-xs text-muted-foreground', isSidebarCollapsed && 'hidden')}>
            Route: {pathname}
          </p>
        </div>
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[18rem] p-4 sm:max-w-[18rem]">
          <SheetTitle className="mb-4">
            <FintrackLogo />
          </SheetTitle>
          <Separator className="mb-4" />
          <SidebarNav onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
