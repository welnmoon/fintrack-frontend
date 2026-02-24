import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { mockTransactions } from '@/entities/transaction'
import { formatCurrency, formatDate } from '@/shared/lib'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { PageContainer, PageHeader } from '@/widgets/page-shell'

const kpis = [
  { title: 'Общий баланс', value: 19341.2, icon: Wallet },
  { title: 'Доходы за месяц', value: 3520, icon: ArrowUpRight },
  { title: 'Расходы за месяц', value: 1860, icon: ArrowDownRight },
  { title: 'Net', value: 1660, icon: Wallet },
]

export function DashboardHomePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Дашборд"
        description="Ключевые показатели по личным финансам за текущий период."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <Icon className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{formatCurrency(item.value)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Mock data</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Динамика баланса</CardTitle>
            <CardDescription>Placeholder для графика</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Chart area
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Структура расходов</CardTitle>
            <CardDescription>Placeholder для круговой диаграммы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Chart area
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние операции</CardTitle>
          <CardDescription>Пять последних записей для визуального каркаса.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.slice(0, 5).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Badge variant={item.kind === 'EXPENSE' ? 'secondary' : 'default'}>{item.kind}</Badge>
                  </TableCell>
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
