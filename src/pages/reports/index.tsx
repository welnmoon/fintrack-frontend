import { useGetDashboard } from "@/features/get-dashboard/api/use-get-dashboard";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import { ExportReportsCard } from "@/widgets/dashboard/export-reports/ui/export-reports-card";

export function ReportsPage() {
  const { data, isLoading } = useGetDashboard();
  const currency =
    data?.accountsTotalBalance.currency ??
    data?.forecast.currency ??
    "KZT";

  return (
    <PageContainer>
      <PageHeader
        title="Отчёты"
        description="Экспортируйте операции и аналитические данные для архива, Excel или внешнего анализа."
      />
      <ExportReportsCard
        data={data}
        currency={currency}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
