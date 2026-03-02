import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/shared/lib";
import { useGetDashboard } from "@/features/get-dashboard/api/use-get-dashboard";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import PieChartWithCustomizedLabel from "@/widgets/dashboard/expense-pie/ui/expense-pie";
import BalanceHistory from "@/widgets/dashboard/balance-history/ui/balance-history";

export function DashboardHomePage() {
  const { data, isLoading, isError } = useGetDashboard();

  // balance
  const totalBalance = data?.accountsTotalBalance.total;
  const totalCurrency = data?.accountsTotalBalance.currency;
  const fxUnavailable = data?.accountsTotalBalance.fxUnavailable ?? false;
  const totalsByCurrency = data?.accountsTotalBalance;

  const income = data?.expenseAndIncomes.income ?? 0;
  const expense = data?.expenseAndIncomes.expense ?? 0;

  const net = income - expense;
  const periodLabel =
    data?.expenseAndIncomes.periodStart && data?.expenseAndIncomes.periodEnd
      ? `${new Date(data.expenseAndIncomes.periodStart).toLocaleDateString("ru-RU")} - ${new Date(data.expenseAndIncomes.periodEnd).toLocaleDateString("ru-RU")}`
      : "Период";

  const kpis = [
    { title: "Доходы", value: income, icon: ArrowUpRight },
    { title: "Расходы", value: expense, icon: ArrowDownRight },
    { title: "Net", value: net, icon: Wallet },
  ];

  // last operations
  const lastTransactions = data?.lastTransactions;
  console.log(lastTransactions);

  const expensePie = data?.expensePie;
  console.log("expensePie: ", expensePie);

  return (
    <PageContainer>
      <PageHeader
        title="Дашборд"
        description="Ключевые показатели по личным финансам за текущий период."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общий баланс
            </CardTitle>
            <Wallet className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-2xl font-semibold tracking-tight">
                {totalBalance === null || totalBalance === undefined
                  ? Object.entries(totalsByCurrency?.totalsByCurrency!).map(
                      ([key, value]) => <p>{formatCurrency(value, key)}</p>,
                    )
                  : formatCurrency(totalBalance, totalCurrency)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {isError
                ? "Ошибка загрузки"
                : fxUnavailable
                  ? "Курс недоступен"
                  : "С сервера"}
            </p>
          </CardContent>
        </Card>

        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="mt-2 h-3 w-40" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(item.value, totalCurrency)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isError ? "Ошибка загрузки" : periodLabel}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Динамика баланса</CardTitle>
            <CardDescription>
              Линейный график изменения баланса по дням
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              <BalanceHistory />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Структура расходов</CardTitle>
            <CardDescription>
              Круговая диаграмма расходов по категориям
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-start rounded-lg border border-dashed text-sm text-muted-foreground">
              <PieChartWithCustomizedLabel data={expensePie ?? []} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние операции</CardTitle>
          <CardDescription>Последние 5 операций пользователя</CardDescription>
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
              {!lastTransactions && <p>Пусто</p>}
              {lastTransactions &&
                lastTransactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.occurredAt)}</TableCell>
                    <TableCell>{item.category?.name}</TableCell>
                    <TableCell>{item.account.currency}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.type === "EXPENSE" ? "secondary" : "default"
                        }
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount, item.account.currency)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
