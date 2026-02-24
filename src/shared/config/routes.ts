export const ROUTES = {
  landing: '/',
  app: '/app',
  overview: '/app/overview',
  expenses: '/app/expenses',
  income: '/app/income',
  accounts: '/app/accounts',
  categories: '/app/categories',
  transfers: '/app/transfers',
  reports: '/app/reports',
  profile: '/app/profile',
  settings: '/app/settings',
} as const

export const APP_ROUTE_TITLES: Record<string, string> = {
  [ROUTES.app]: 'Главное',
  [ROUTES.overview]: 'Главное',
  [ROUTES.expenses]: 'Расходы',
  [ROUTES.income]: 'Доходы',
  [ROUTES.accounts]: 'Счета',
  [ROUTES.categories]: 'Категории',
  [ROUTES.transfers]: 'Переводы',
  [ROUTES.reports]: 'Отчеты',
  [ROUTES.profile]: 'Профиль',
  [ROUTES.settings]: 'Настройки',
}
