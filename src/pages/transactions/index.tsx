import { PageContainer, PageHeader } from '@/widgets/page-shell'
import { Card, CardContent } from '@/shared/ui'

export function TransactionsPage() {
  return (
    <PageContainer>
      <PageHeader title="Транзакции" description="Опциональная страница под общий журнал операций." />
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Раздел пока не подключен в роутинг.</CardContent>
      </Card>
    </PageContainer>
  )
}
