import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Gauge,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { EmotionBadge } from "@/entities/transaction";
import { formatCurrency, formatDate } from "@/shared/lib";
import { useGetDashboard } from "@/features/get-dashboard/api/use-get-dashboard";
import { useExpensePie } from "@/features/get-dashboard/api/use-expense-pie";
import { forecastConfidenceMap } from "@/features/get-dashboard/model/const";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import PieChartWithCustomizedLabel from "@/widgets/dashboard/expense-pie/ui/expense-pie";
import BalanceHistory from "@/widgets/dashboard/balance-history/ui/balance-history";
import PriceChart from "@/widgets/dashboard/forex-chart/ui/forex-chart";
import { DateRangePicker } from "@/widgets/dashboard/expense-pie/ui/date-range-picker";
import { EmotionSummaryCard } from "@/widgets/dashboard/emotion-summary/ui/emotion-summary-card";

export function DashboardHomePage() {
  const [pendingExpensePieRange, setPendingExpensePieRange] = useState<
    DateRange | undefined
  >(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now,
    };
  });
  const [expensePieRange, setExpensePieRange] = useState<DateRange | undefined>(
    pendingExpensePieRange,
  );
  const { data, isLoading, isError } = useGetDashboard();
  const expensePieQuery = useExpensePie({
    from: expensePieRange?.from,
    to: expensePieRange?.to,
    limit: 10,
  });

  // balance
  const totalBalance = data?.accountsTotalBalance.total;
  const totalCurrency = data?.accountsTotalBalance.currency;
  const fxUnavailable = data?.accountsTotalBalance.fxUnavailable ?? false;
  const fxStale = data?.accountsTotalBalance.fxStale ?? false;
  const totalsByCurrency = data?.accountsTotalBalance;
  const totalsByCurrencyMap =
    totalsByCurrency?.totalsByCurrency ?? ({} as Record<string, number>);

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
  const expensePieData = expensePieQuery.data;
  const expensePieItems = expensePieData?.items ?? [];
  const expensePieCurrency =
    expensePieData?.currency ?? data?.expensePie.currency ?? totalCurrency ?? "KZT";
  const expensePieFxUnavailable = expensePieData?.fxUnavailable ?? false;
  const expensePieFxStale = expensePieData?.fxStale ?? false;
  const expensePieLoading = expensePieQuery.isLoading;
  const expensePieError = expensePieQuery.isError;
  const forecast = data?.forecast;
  const forecastCurrency = forecast?.currency ?? totalCurrency ?? "KZT";
  const forecastConfidence = forecast
    ? forecastConfidenceMap[forecast.confidence]
    : null;
  const projectedDelta = forecast
    ? forecast.projectedEndBalance - forecast.currentBalance
    : 0;

  const handleExpensePieRangeChange = (nextRange: DateRange | undefined) => {
    setPendingExpensePieRange(nextRange);
    if (!nextRange?.from || !nextRange?.to) return;
    setExpensePieRange(nextRange);
  };

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
                  ? Object.entries(totalsByCurrencyMap).map(([key, value]) => (
                      <p key={key}>{formatCurrency(value, key)}</p>
                    ))
                  : formatCurrency(totalBalance, totalCurrency)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {isError
                ? "Ошибка загрузки"
                : fxUnavailable
                  ? "Курс недоступен"
                  : fxStale
                    ? "Данные могут быть не актуальны"
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

      <Card>
        <CardHeader>
          <CardTitle>Прогноз до конца месяца</CardTitle>
          <CardDescription>
            Оценка остатка и темпа расходов на основе текущего месяца и
            последних 7 дней.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
              <Skeleton className="h-20 rounded-xl" />
            </>
          ) : isError || !forecast ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-destructive">
              Не удалось загрузить прогноз расходов.
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-card/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      Текущий баланс
                    </span>
                    <Wallet className="h-4 w-4 text-accent" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {formatCurrency(forecast.currentBalance, forecastCurrency)}
                  </p>
                </div>

                <div className="rounded-2xl border bg-card/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      Прогноз остатка
                    </span>
                    <CalendarDays className="h-4 w-4 text-accent" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {formatCurrency(
                      forecast.projectedEndBalance,
                      forecastCurrency,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {projectedDelta <= 0 ? "Изменение" : "Потенциальный запас"}:{" "}
                    {formatCurrency(Math.abs(projectedDelta), forecastCurrency)}
                  </p>
                </div>

                <div className="rounded-2xl border bg-card/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      Ожидаемые траты
                    </span>
                    <TrendingDown className="h-4 w-4 text-accent" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {formatCurrency(
                      forecast.forecastFutureExpense,
                      forecastCurrency,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    До конца месяца: {forecast.daysRemaining} дн.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Дневной темп расходов
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Скользящая модель на основе месяца и последних 7 дней
                      </p>
                    </div>
                    <Gauge className="h-4 w-4 text-accent" />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border bg-background px-3 py-3">
                      <p className="text-xs text-muted-foreground">
                        Среднее по месяцу
                      </p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(forecast.monthAvg, forecastCurrency)}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-background px-3 py-3">
                      <p className="text-xs text-muted-foreground">
                        Среднее за 7 дней
                      </p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(forecast.recent7Avg, forecastCurrency)}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-background px-3 py-3">
                      <p className="text-xs text-muted-foreground">
                        Итоговый темп
                      </p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(
                          forecast.blendedDailyExpense,
                          forecastCurrency,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Надёжность прогноза</p>
                      <p className="text-xs text-muted-foreground">
                        На основе истории расходов за текущий месяц
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {forecastConfidence?.label ?? "Нет оценки"}
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {forecastConfidence?.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Операций учтено
                      </span>
                      <span className="font-medium">
                        {forecast.basedOnTransactionsCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Уже потрачено
                      </span>
                      <span className="font-medium">
                        {formatCurrency(forecast.spentSoFar, forecastCurrency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        За последние 7 дней
                      </span>
                      <span className="font-medium">
                        {formatCurrency(forecast.recent7Spent, forecastCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <EmotionSummaryCard
        summary={data?.emotionsSummary}
        isLoading={isLoading}
        isError={isError}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Динамика баланса</CardTitle>
            <CardDescription>
              Линейный график изменения баланса по дням, неделям и месяцам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-lg border border-dashed p-3">
              <BalanceHistory />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Структура расходов</CardTitle>
            <CardDescription>
              Круговая диаграмма расходов по категориям в валюте {expensePieCurrency}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DateRangePicker
              value={pendingExpensePieRange}
              onChange={handleExpensePieRangeChange}
            />

            {expensePieLoading ? (
              <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : expensePieError ? (
              <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
                Не удалось загрузить структуру расходов
              </div>
            ) : (
              <div className="h-80 rounded-lg border border-dashed p-3">
                <PieChartWithCustomizedLabel
                  data={expensePieItems}
                  currency={expensePieCurrency}
                />
              </div>
            )}

            {expensePieFxUnavailable ? (
              <p className="mt-2 text-xs text-muted-foreground">
                FX временно недоступен. Показаны сырые суммы по категориям без
                полной конвертации.
              </p>
            ) : expensePieFxStale ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Используются последние сохраненные курсы из Redis. Данные могут
                быть не актуальны.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <PriceChart />

      <Card>
        <CardHeader>
          <CardTitle>Последние операции</CardTitle>
          <CardDescription>Последние 5 операций пользователя</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!lastTransactions?.length ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Пока нет операций
            </div>
          ) : (
            lastTransactions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-card/70 p-4 transition-colors hover:bg-muted/20"
              >
                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center">
                  <div className="rounded-2xl bg-muted/40 px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Дата
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {formatDate(item.occurredAt)}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          item.type === "EXPENSE" ? "secondary" : "default"
                        }
                      >
                        {item.type}
                      </Badge>
                      {item.emotion && <EmotionBadge emotion={item.emotion} />}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          Категория
                        </p>
                        <p className="mt-1 truncate text-sm font-medium">
                          {item.category?.name ?? "Без категории"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          Валюта счета
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {item.account.currency}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-primary/[0.05] px-4 py-3 text-left md:min-w-40 md:text-right">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Сумма
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight">
                      {formatCurrency(item.amount, item.account.currency)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
