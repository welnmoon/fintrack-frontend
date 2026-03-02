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
        <CardHeader>
          <CardTitle>Отчеты по финансам</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Здесь будут сводные отчеты по доходам, расходам и балансу за
            выбранный период.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
