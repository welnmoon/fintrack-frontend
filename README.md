# Fintrack Frontend Scaffold

UI-каркас дипломного проекта по учету личных финансов.

Стек:
- React + Vite + TypeScript
- Tailwind CSS
- shadcn/ui
- react-router-dom
- lucide-react

## Запуск

```bash
npm install
npm run dev
```

Дополнительно:

```bash
npm run lint
npm run build
```

## Что реализовано

- Лендинг (`/`) с hero, возможностями, шагами и footer.
- Dashboard layout (`/app`) с:
- sidebar (desktop + mobile sheet)
- topbar
- контентной областью
- FSD-структура с разделением на `app/pages/widgets/features/entities/shared`.
- Набор UI-компонентов в стиле shadcn/ui в `src/shared/ui/components`.
- Mock-данные для сущностей (пользователь, счета, категории, транзакции).
- Роутинг без серверной логики и API-клиентов.

## Роуты

- `/` -> LandingPage
- `/app` и `/app/overview` -> DashboardHomePage
- `/app/expenses` -> ExpensesPage
- `/app/income` -> IncomePage
- `/app/accounts` -> AccountsPage
- `/app/categories` -> CategoriesPage
- `/app/transfers` -> TransfersPage
- `/app/reports` -> ReportsPage
- `/app/profile` -> ProfilePage
- `/app/settings` -> SettingsPage
- `*` -> NotFoundPage

## FSD структура

```text
src/
  app/
    providers/
    layouts/
    router/
    styles/
    index.ts
  pages/
    landing/
    dashboard/
    expenses/
    income/
    transactions/
    accounts/
    categories/
    transfers/
    reports/
    profile/
    settings/
    not-found/
  widgets/
    sidebar/
    header/
    page-shell/
  features/
    sidebar-toggle/
  entities/
    user/
    account/
    transaction/
    category/
  shared/
    ui/
    lib/
    config/
    assets/
    types/
    const/
```

## Примечание

Проект содержит только UI/структуру и mock placeholders. Интеграции с API, управление серверным состоянием и бизнес-логика намеренно не добавлялись.
