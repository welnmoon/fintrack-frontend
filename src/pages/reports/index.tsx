import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { PageContainer, PageHeader } from '@/widgets/page-shell'

export function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Отчеты"
        description="Раздел аналитики находится в планируемых доработках."
      />

      <Card>
        <CardHeader>
          <CardTitle>Скоро здесь будет модуль отчетности</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Раздел отчетов будет добавлен позже. На текущем этапе это UI-заглушка.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
