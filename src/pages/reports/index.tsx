import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

export function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Отчеты"
        description="Раздел аналитики находится в планируемых доработках."
      />

      <Card>
        <CardHeader className="border-b border-[#EDEAE4]">
          <CardTitle className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
            Отчеты по финансам
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-[#AAA49C]">
            Здесь будут сводные отчеты по доходам, расходам и балансу за
            выбранный период.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
