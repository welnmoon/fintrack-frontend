import { Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/lib'
import { Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui'
import { PageContainer, PageHeader } from '@/widgets/page-shell'

const transferRows = [
  {
    id: 'trf-1',
    date: '2026-02-19',
    fromAccount: 'Накопительный счет',
    toAccount: 'Основная карта',
    amount: 500,
  },
  {
    id: 'trf-2',
    date: '2026-02-17',
    fromAccount: 'Основная карта',
    toAccount: 'Наличные',
    amount: 200,
  },
  {
    id: 'trf-3',
    date: '2026-02-14',
    fromAccount: 'Основная карта',
    toAccount: 'Крипто-кошелек',
    amount: 350,
  },
]

export function TransfersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Переводы"
        description="Внутренние переводы между счетами (mock)."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Создать перевод
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Со счета</TableHead>
                <TableHead>На счет</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transferRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.fromAccount}</TableCell>
                  <TableCell>{item.toAccount}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
