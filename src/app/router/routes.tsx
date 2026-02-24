import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/app/layouts/dashboard-layout";
import { AccountsPage } from "@/pages/accounts";
import { CategoriesPage } from "@/pages/categories";
import { DashboardHomePage } from "@/pages/dashboard";
import { ExpensesPage } from "@/pages/expenses";
import { IncomePage } from "@/pages/income";
import { LandingPage } from "@/pages/landing";
import { NotFoundPage } from "@/pages/not-found";
import { ProfilePage } from "@/pages/profile";
import { ReportsPage } from "@/pages/reports";
import { SettingsPage } from "@/pages/settings";
import { TransfersPage } from "@/pages/transfers";
import { ROUTES } from "@/shared/config";

const toChildPath = (fullPath: string) =>
  fullPath.replace(`${ROUTES.app}/`, "");

export const appRouter = createBrowserRouter([
  {
    path: ROUTES.landing,
    element: <LandingPage />,
  },
  {
    path: ROUTES.app,
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
      {
        path: toChildPath(ROUTES.overview),
        element: <DashboardHomePage />,
      },
      {
        path: toChildPath(ROUTES.expenses),
        element: <ExpensesPage />,
      },
      {
        path: toChildPath(ROUTES.income),
        element: <IncomePage />,
      },
      {
        path: toChildPath(ROUTES.accounts),
        element: <AccountsPage />,
      },
      {
        path: toChildPath(ROUTES.categories),
        element: <CategoriesPage />,
      },
      {
        path: toChildPath(ROUTES.transfers),
        element: <TransfersPage />,
      },
      {
        path: toChildPath(ROUTES.reports),
        element: <ReportsPage />,
      },
      {
        path: toChildPath(ROUTES.profile),
        element: <ProfilePage />,
      },
      {
        path: toChildPath(ROUTES.settings),
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
