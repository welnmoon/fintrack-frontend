import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebarToggle } from '@/features/sidebar-toggle'
import { APP_ROUTE_TITLES, ROUTES } from '@/shared/config'
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { mockUser } from '@/entities/user'

export function Topbar() {
  const { pathname } = useLocation()
  const { isSidebarCollapsed, setMobileSidebarOpen, toggleSidebarCollapse } = useSidebarToggle()
  const pageTitle = APP_ROUTE_TITLES[pathname] ?? 'Fintrack'

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hidden md:inline-flex"
            onClick={toggleSidebarCollapse}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fintrack</p>
            <h2 className="text-base font-semibold">{pageTitle}</h2>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 rounded-full px-2">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback>{mockUser.initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{mockUser.fullName}</p>
              <p className="text-xs font-normal text-muted-foreground">{mockUser.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.profile}>Профиль</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={ROUTES.settings}>Настройки</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.landing}>На лендинг</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
