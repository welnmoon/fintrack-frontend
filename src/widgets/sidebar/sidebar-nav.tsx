import {
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  Gauge,
  Settings,
  Tags,
  TrendingDown,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib'
import type { ComponentType } from 'react'

interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Главное', to: ROUTES.overview, icon: Gauge },
  { label: 'Расходы', to: ROUTES.expenses, icon: TrendingDown },
  { label: 'Доходы', to: ROUTES.income, icon: TrendingUp },
  { label: 'Счета', to: ROUTES.accounts, icon: CreditCard },
  { label: 'Категории', to: ROUTES.categories, icon: Tags },
  { label: 'Переводы', to: ROUTES.transfers, icon: ArrowLeftRight },
  { label: 'Отчеты', to: ROUTES.reports, icon: BarChart3 },
  { label: 'Профиль', to: ROUTES.profile, icon: UserRound },
  { label: 'Настройки', to: ROUTES.settings, icon: Settings },
]

interface SidebarNavItemProps {
  item: NavItem
  isCollapsed?: boolean
  onNavigate?: () => void
}

function SidebarNavItem({ item, isCollapsed, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon
  const { pathname } = useLocation()

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => {
        const isOverviewRoute =
          item.to === ROUTES.overview && (pathname === ROUTES.app || pathname === ROUTES.overview)
        const isCurrent = isActive || isOverviewRoute

        return cn(
          'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isCurrent
            ? 'bg-accent/15 text-accent'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          isCollapsed && 'justify-center px-2',
        )
      }}
      end={item.to === ROUTES.overview}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn('ml-3 truncate', isCollapsed && 'hidden')}>{item.label}</span>
    </NavLink>
  )
}

interface SidebarNavProps {
  isCollapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ isCollapsed, onNavigate }: SidebarNavProps) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <SidebarNavItem
          key={item.to}
          item={item}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}
