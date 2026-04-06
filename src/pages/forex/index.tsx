import { Link } from "react-router-dom";
import { Button, Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import PriceChart from "@/widgets/dashboard/forex-chart/ui/forex-chart";

export function ForexPage() {
  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Forex"
        description="Подробный просмотр котировок с выбором валютной пары, таймфрейма и вида графика."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.overview}>Назад к дашборду</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <PriceChart
            showChartTypeControl
            showExtendedMeta
            chartViewportClassName="h-[58vh] min-h-[420px] lg:h-[72vh]"
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
