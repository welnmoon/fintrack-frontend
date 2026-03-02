import { PageContainer, PageHeader } from "@/widgets/page-shell";
import { Card, CardContent } from "@/shared/ui";

export function TransactionsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Транзакции"
        description="Общий журнал всех операций пользователя."
      />
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Здесь будет таблица всех транзакций с фильтрами по периоду, счету и
          категории.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
