import { Navigate, Outlet } from "react-router-dom";
import {
  SidebarToggleProvider,
  useSidebarToggle,
} from "@/features/sidebar-toggle";
import { cn } from "@/shared/lib";
import { Topbar } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { ROUTES } from "@/shared/config";

function DashboardScaffold() {
  const { isSidebarCollapsed } = useSidebarToggle();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-200 md:pl-72",
          isSidebarCollapsed && "md:pl-24",
        )}
      >
        <Topbar />
        <main className="container py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const { data, isLoading, isError, error } = useGetUser();

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-medium text-muted-foreground">
          Загрузка данных...
        </p>
      </div>
    );

  if (isError) {
    if (error instanceof Error && error.message.startsWith("Unauthorized")) {
      return <Navigate to={ROUTES.login} replace />;
    }

    return <p>Error {error.message}</p>;
  }

  if (!data) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <SidebarToggleProvider>
      <DashboardScaffold />
    </SidebarToggleProvider>
  );
}
