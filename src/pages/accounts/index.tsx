import { Plus } from 'lucide-react'
import { mockAccounts } from '@/entities/account'
import { formatCurrency } from '@/shared/lib'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { PageContainer, PageHeader } from '@/widgets/page-shell'

export function AccountsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Счета"
        description="Карточки счетов для визуального отображения структуры баланса."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Создать счет
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockAccounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="space-y-3 pb-2">
              <Badge variant="secondary" className="w-fit">
                {account.type}
              </Badge>
              <CardTitle>{account.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Mock balance</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
