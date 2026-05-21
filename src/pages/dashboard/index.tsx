import React, { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Link } from "react-router-dom";
import { AlertTriangle, Info, RotateCw, TrendingUp } from "lucide-react";
import type { FinancialInsight } from "@/features/get-dashboard/model/types.api";
import { getTransactionEmotionMeta } from "@/entities/transaction";
import { formatCurrency, formatDate } from "@/shared/lib";
import { useGetDashboard } from "@/features/get-dashboard/api/use-get-dashboard";
import { useExpensePie } from "@/features/get-dashboard/api/use-expense-pie";
import { forecastConfidenceMap } from "@/features/get-dashboard/model/const";
import { ROUTES } from "@/shared/config";
import {
  Button,
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
import { ExportReportsCard } from "@/widgets/dashboard/export-reports/ui/export-reports-card";

const insightMeta: Record<
  FinancialInsight["type"],
  {
    Icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    label: string;
    accentBar: string;
  }
> = {
  warning: {
    Icon: AlertTriangle,
    iconBg: "bg-[#FEF5E6]",
    iconColor: "text-[#C07C1A]",
    badgeBorder: "border-[#F3D9A0]",
    badgeBg: "bg-[#FEF5E6]",
    badgeText: "text-[#C07C1A]",
    label: "внимание",
    accentBar: "bg-[#E8A020]",
  },
  positive: {
    Icon: TrendingUp,
    iconBg: "bg-[#EDFAF4]",
    iconColor: "text-[#1A9E6A]",
    badgeBorder: "border-[#C2EDD8]",
    badgeBg: "bg-[#EDFAF4]",
    badgeText: "text-[#1A9E6A]",
    label: "хорошо",
    accentBar: "bg-[#1A9E6A]",
  },
  info: {
    Icon: Info,
    iconBg: "bg-[#F0F4FF]",
    iconColor: "text-[#2A4490]",
    badgeBorder: "border-[#C0CCF0]",
    badgeBg: "bg-[#F0F4FF]",
    badgeText: "text-[#2A4490]",
    label: "инфо",
    accentBar: "bg-[#2A4490]",
  },
};

function FinancialInsightsBlock({
  insights,
  isLoading,
}: {
  insights?: FinancialInsight[];
  isLoading?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#DDD9D1] bg-white">
      <div className="flex flex-wrap items-baseline gap-3 border-b border-[#EDEAE4] px-6 py-4">
        <span className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
          Финансовые инсайты
        </span>
        <span className="text-xs text-[#B5B0A8]">
          Короткие выводы на основе расходов, прогноза и эмоциональных меток
        </span>
      </div>

      {isLoading ? (
        <div className="divide-y divide-[#F4F2EE]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-4">
              <Skeleton className="h-8 w-8 flex-shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2 pt-0.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>
          ))}
        </div>
      ) : !insights?.length ? null : (
        <div className="divide-y divide-[#F4F2EE]">
          {insights.map((insight, index) => {
            const meta = insightMeta[insight.type];
            return (
              <div
                key={index}
                className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-[#FAFAF8]"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.iconBg}`}
                  >
                    <meta.Icon className={`h-4 w-4 ${meta.iconColor}`} />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${meta.accentBar}`}
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] font-semibold leading-snug text-[#111]">
                    {insight.title}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-[1.5] text-[#888]">
                    {insight.description}
                  </p>
                </div>
                <span
                  className={`mt-0.5 flex-shrink-0 rounded-full border px-[9px] py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.5px] ${meta.badgeBorder} ${meta.badgeBg} ${meta.badgeText}`}
                >
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const { data, isLoading, isError, refetch: refetchDashboard } = useGetDashboard();
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

  // last operations
  const lastTransactions = data?.lastTransactions?.slice(0, 5);
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
  const formattedLongDate = (value: string | Date) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
      .format(new Date(value))
      .replace(" г.", "");
  const balanceStatus = isError
    ? "Ошибка загрузки"
    : fxUnavailable
      ? "Курс недоступен"
      : fxStale
        ? "Данные могут быть не актуальны"
        : null;

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
        actions={
          <button
            type="button"
            onClick={() => {
              void refetchDashboard();
              void expensePieQuery.refetch();
            }}
            className="inline-flex items-center rounded-[7px] border border-[#DDD9D1] px-2.5 py-1.5 font-mono text-[11px] text-[#B5B0A8] transition-colors hover:bg-white hover:text-[#555]"
            aria-label="Обновить данные"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        }
      />

      <div className="overflow-hidden rounded-[14px] border border-[#DDD9D1] bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          <div className="border-b border-[#DDD9D1] p-6 md:border-r xl:border-b-0">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[#AAA49C]">
              Общий баланс
            </p>
            {isLoading ? (
              <Skeleton className="mb-3 h-9 w-44" />
            ) : (
              <div className="mb-3 space-y-1">
                {totalBalance === null || totalBalance === undefined ? (
                  Object.entries(totalsByCurrencyMap).map(([key, value]) => (
                    <p
                      key={key}
                      className="font-mono text-3xl font-bold leading-none tracking-[-1.5px] text-[#111]"
                    >
                      {formatCurrency(value, key)}
                    </p>
                  ))
                ) : (
                  <p className="font-mono text-3xl font-bold leading-none tracking-[-1.5px] text-[#111]">
                    {formatCurrency(totalBalance, totalCurrency)}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              {isLoading ? (
                <>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </>
              ) : (
                <>
                  <span className="text-xs text-[#C0BCB4]">
                    {balanceStatus ?? ""}
                  </span>
                  <span className="rounded-full bg-[#F2F1EE] px-2 py-[2px] text-[10px] font-semibold text-[#888]">
                    KZT
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="border-b border-[#DDD9D1] p-6 xl:border-r xl:border-b-0">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[#AAA49C]">
              Доходы
            </p>
            {isLoading ? (
              <Skeleton className="mb-3 h-9 w-36" />
            ) : (
              <p className="mb-3 font-mono text-3xl font-bold leading-none tracking-[-1.5px] text-[#1A9E6A]">
                {formatCurrency(income, totalCurrency)}
              </p>
            )}
            <div className="flex items-center justify-between">
              {isLoading ? (
                <>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </>
              ) : (
                <>
                  <span className="text-xs text-[#C0BCB4]">
                    {isError ? "Ошибка загрузки" : periodLabel}
                  </span>
                  <span className="rounded-full bg-[#EDFAF4] px-2 py-[2px] text-[10px] font-semibold text-[#1A9E6A]">
                    ↑ доход
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="border-b border-[#DDD9D1] p-6 md:border-r md:border-b-0 xl:border-b-0">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[#AAA49C]">
              Расходы
            </p>
            {isLoading ? (
              <Skeleton className="mb-3 h-9 w-36" />
            ) : (
              <p className="mb-3 font-mono text-3xl font-bold leading-none tracking-[-1.5px] text-[#D94F3D]">
                {formatCurrency(expense, totalCurrency)}
              </p>
            )}
            <div className="flex items-center justify-between">
              {isLoading ? (
                <>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </>
              ) : (
                <>
                  <span className="text-xs text-[#C0BCB4]">
                    {isError ? "Ошибка загрузки" : periodLabel}
                  </span>
                  <span className="rounded-full bg-[#FEF1EF] px-2 py-[2px] text-[10px] font-semibold text-[#D94F3D]">
                    ↓ трата
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[#AAA49C]">
              Net
            </p>
            {isLoading ? (
              <Skeleton className="mb-3 h-9 w-36" />
            ) : (
              <p className="mb-3 font-mono text-3xl font-bold leading-none tracking-[-1.5px] text-[#2A4490]">
                {formatCurrency(net, totalCurrency)}
              </p>
            )}
            <div className="flex items-center justify-between">
              {isLoading ? (
                <>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </>
              ) : (
                <>
                  <span className="text-xs text-[#C0BCB4]">
                    {isError ? "Ошибка загрузки" : periodLabel}
                  </span>
                  <span className="rounded-full bg-[#F0F4FF] px-2 py-[2px] text-[10px] font-semibold text-[#3A5BC7]">
                    = итог
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-72" />
              <div className="grid gap-3 md:grid-cols-2">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            </div>
          ) : isError || !forecast ? (
            <div className="p-6">
              <div className="rounded-xl border border-dashed p-4 text-sm text-destructive">
                Не удалось загрузить прогноз расходов.
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[14px] border border-[#DDD9D1] bg-white">
              <div className="flex flex-wrap items-baseline gap-3 border-b border-[#EDEAE4] px-6 py-4">
                <span className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
                  Прогноз до конца месяца
                </span>
                <span className="text-xs text-[#B5B0A8]">
                  Оценка остатка и темпа на основе текущего месяца и последних 7
                  дней
                </span>
              </div>

              <div className="grid grid-cols-1 border-b border-[#EDEAE4] md:grid-cols-2">
                <div className="border-b border-[#EDEAE4] px-6 py-5 md:border-r md:border-b-0">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.8px] text-[#AAA49C]">
                    Прогноз остатка
                  </p>
                  <p className="mb-1 font-mono text-[26px] font-semibold leading-none tracking-[-1.2px] text-[#111]">
                    {formatCurrency(forecast.projectedEndBalance, forecastCurrency)}
                  </p>
                  <p className="text-[11px] text-[#C0BCB4]">
                    Ожидаемое снижение:{" "}
                    <span className="font-mono font-medium text-[#D94F3D]">
                      −{formatCurrency(forecast.forecastFutureExpense, forecastCurrency)}
                    </span>
                  </p>
                </div>

                <div className="relative px-6 py-5">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.8px] text-[#AAA49C]">
                    Ожидаемые траты
                  </p>
                  <p className="mb-1 font-mono text-[26px] font-semibold leading-none tracking-[-1.2px] text-[#111]">
                    {formatCurrency(
                      forecast.forecastFutureExpense,
                      forecastCurrency,
                    )}
                  </p>
                  <p className="text-[11px] text-[#C0BCB4]">
                    До конца месяца:{" "}
                    <span className="font-mono font-medium text-[#888]">
                      {forecast.daysRemaining} дн.
                    </span>
                  </p>
                  <span className="absolute right-5 top-5 rounded-full border border-[#E6E3DC] bg-[#F7F6F3] px-[9px] py-[3px] text-[10px] font-semibold tracking-[0.3px] text-[#888]">
                    {forecast.daysRemaining} дней
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="border-b border-[#EDEAE4] lg:border-r lg:border-b-0">
                  <div className="border-b border-[#EDEAE4] px-6 py-4">
                    <p className="mb-0.5 text-xs font-semibold text-[#333]">
                      Дневной темп расходов
                    </p>
                    <p className="text-[11px] text-[#B5B0A8]">
                      Скользящая модель · месяц и последние 7 дней
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3">
                    <div className="border-b border-[#EDEAE4] px-5 py-4 sm:border-r sm:border-b-0">
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.5px] text-[#C0BCB4]">
                        По месяцу
                      </p>
                      <p className="font-mono text-base font-semibold leading-none tracking-[-0.5px] text-[#111]">
                        {formatCurrency(forecast.monthAvg, forecastCurrency)}
                      </p>
                    </div>
                    <div className="border-b border-[#EDEAE4] px-5 py-4 sm:border-r sm:border-b-0">
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.5px] text-[#C0BCB4]">
                        За 7 дней
                      </p>
                      <p className="font-mono text-base font-semibold leading-none tracking-[-0.5px] text-[#111]">
                        {formatCurrency(forecast.recent7Avg, forecastCurrency)}
                      </p>
                    </div>
                    <div className="px-5 py-4">
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.5px] text-[#C0BCB4]">
                        Итоговый
                      </p>
                      <p className="font-mono text-base font-semibold leading-none tracking-[-0.5px] text-[#111]">
                        {formatCurrency(
                          forecast.blendedDailyExpense,
                          forecastCurrency,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 border-b border-[#EDEAE4] px-6 py-4">
                    <p className="text-xs font-semibold text-[#333]">
                      Надёжность прогноза
                    </p>
                    <span className="whitespace-nowrap rounded-full border border-[#F3D9A0] bg-[#FEF5E6] px-[9px] py-[3px] text-[10px] font-semibold text-[#C07C1A]">
                      {forecastConfidence?.label ?? "Нет оценки"}
                    </span>
                  </div>

                  <div className="px-6 py-3.5">
                    <p className="mb-1 border-b border-[#EDEAE4] pb-3 text-[11.5px] leading-[1.5] text-[#999]">
                      {forecastConfidence?.description}
                    </p>
                    <div className="flex items-center justify-between gap-3 border-b border-[#F4F2EE] py-2">
                      <span className="text-[11px] text-[#AAA49C]">
                        Операций учтено
                      </span>
                      <span className="font-mono text-xs font-medium text-[#333]">
                        {forecast.basedOnTransactionsCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-[#F4F2EE] py-2">
                      <span className="text-[11px] text-[#AAA49C]">
                        Уже потрачено
                      </span>
                      <span className="font-mono text-xs font-medium text-[#333]">
                        {formatCurrency(forecast.spentSoFar, forecastCurrency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-[#F4F2EE] py-2">
                      <span className="text-[11px] text-[#AAA49C]">
                        За последние 7 дней
                      </span>
                      <span className="font-mono text-xs font-medium text-[#333]">
                        {formatCurrency(forecast.recent7Spent, forecastCurrency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#AAA49C]">
                        Средств хватит примерно на
                      </span>
                      <span className="font-mono text-xs font-medium text-[#333]">
                        {forecast.daysToZero !== null
                          ? `${forecast.daysToZero} дн.`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EDEAE4] px-6 py-5">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.5px] text-[#AAA49C]">
                  Сценарии прогноза
                </p>
                <div>
                  {(
                    [
                      {
                        label: "По среднему за месяц",
                        scenario: forecast.scenarios.byMonthAverage,
                      },
                      {
                        label: "Смешанная оценка",
                        scenario: forecast.scenarios.blended,
                      },
                      {
                        label: "По последним 7 дням",
                        scenario: forecast.scenarios.byRecentAverage,
                      },
                    ] as const
                  ).map(({ label, scenario }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 border-b border-[#F4F2EE] py-2.5 last:border-b-0"
                    >
                      <span className="text-[12px] text-[#888]">{label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-[#AAA49C]">
                          −
                          {formatCurrency(
                            scenario.expectedExpense,
                            forecastCurrency,
                          )}
                        </span>
                        <span className="w-[130px] text-right font-mono text-[12px] font-semibold text-[#111]">
                          {formatCurrency(
                            scenario.projectedEndBalance,
                            forecastCurrency,
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="border-t border-[#EDEAE4] px-6 py-3 text-[11px] text-[#AAA49C]">
                {forecast.calculationNote}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <EmotionSummaryCard
        summary={data?.emotionsSummary}
        isLoading={isLoading}
        isError={isError}
      />

      <FinancialInsightsBlock
        insights={data?.insights}
        isLoading={isLoading}
      />

      <Card className="overflow-hidden border-[#DDD9D1]">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 xl:grid-cols-2">
            <div className="flex min-h-[460px] flex-col border-b border-[#EDEAE4] xl:border-r xl:border-b-0">
              <div className="border-b border-[#EDEAE4] px-6 py-4">
                <div className="mb-0.5 text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
                  Динамика баланса
                </div>
                <div className="text-[11px] text-[#B5B0A8]">
                  Изменение баланса по дням, неделям и месяцам
                </div>
              </div>
              <div className="min-h-0 flex-1">
                <BalanceHistory />
              </div>
            </div>

            <div className="flex min-h-[460px] flex-col">
              <div className="border-b border-[#EDEAE4] px-6 py-4">
                <div className="mb-0.5 text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
                  Структура расходов
                </div>
                <div className="text-[11px] text-[#B5B0A8]">
                  Круговая диаграмма расходов по категориям · {expensePieCurrency}
                </div>
              </div>

              <div className="border-b border-[#EDEAE4] px-6 py-3">
                <DateRangePicker
                  value={pendingExpensePieRange}
                  onChange={handleExpensePieRangeChange}
                  buttonClassName="w-auto"
                />
              </div>

              <div className="min-h-0 flex-1">
                {expensePieLoading ? (
                  <div className="flex h-full items-center justify-center px-6 py-5">
                    <Skeleton className="h-44 w-44 rounded-full" />
                  </div>
                ) : expensePieError ? (
                  <div className="flex h-full items-center justify-center px-6 py-5 text-sm text-destructive">
                    Не удалось загрузить структуру расходов
                  </div>
                ) : (
                  <div className="h-full">
                    <PieChartWithCustomizedLabel
                      data={expensePieItems}
                      currency={expensePieCurrency}
                    />
                  </div>
                )}
              </div>

              {expensePieFxUnavailable ? (
                <p className="border-t border-[#EDEAE4] px-6 py-2.5 text-xs text-[#AAA49C]">
                  FX временно недоступен. Показаны сырые суммы по категориям без
                  полной конвертации.
                </p>
              ) : expensePieFxStale ? (
                <p className="border-t border-[#EDEAE4] px-6 py-2.5 text-xs text-[#AAA49C]">
                  Используются последние сохраненные курсы из Redis. Данные
                  могут быть не актуальны.
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-[#DDD9D1]">
        <CardHeader
          className="flex flex-col gap-3 border-b border-[#EDEAE4] px-6 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <CardTitle className="mb-0.5 text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
              Forex
            </CardTitle>
            <CardDescription className="text-[11px] text-[#B5B0A8]">
              Живые котировки валютных пар · для полного анализа откройте
              отдельную страницу
            </CardDescription>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 rounded-[8px] border-[#DDD9D1] bg-transparent px-3.5 text-xs font-medium text-[#555] hover:bg-[#F7F6F3] hover:text-[#111]"
          >
            <Link to={ROUTES.forex}>Смотреть подробно →</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <PriceChart
            variant="dashboard"
            showChartTypeControl={false}
            chartViewportClassName="h-[256px]"
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-[#DDD9D1]">
        <CardHeader className="flex flex-row items-baseline justify-between border-b border-[#EDEAE4] px-6 py-4">
          <div>
            <CardTitle className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
              Последние операции
            </CardTitle>
            <CardDescription className="mt-0.5 text-[11px] text-[#B5B0A8]">
              5 последних операций пользователя
            </CardDescription>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-7 rounded-[7px] border-[#DDD9D1] px-3 text-xs font-medium text-[#888] hover:bg-[#F7F6F3] hover:text-[#333]"
          >
            <Link to={ROUTES.reports}>Смотреть все →</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden border-b border-[#EDEAE4] bg-[#FAFAF8] px-6 py-2.5 md:grid md:grid-cols-[110px_minmax(0,1fr)_180px_80px_140px] md:gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
              Дата
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
              Категория
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
              Тип · Эмоция
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
              Валюта
            </span>
            <span className="text-right font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
              Сумма
            </span>
          </div>

          {!lastTransactions?.length ? (
            <div className="px-6 py-8 text-center text-sm text-[#AAA49C]">
              Пока нет операций
            </div>
          ) : (
            lastTransactions.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 border-b border-[#F4F2EE] px-6 py-3.5 transition-colors last:border-b-0 hover:bg-[#FAFAF8] md:grid-cols-[110px_minmax(0,1fr)_180px_80px_140px] md:items-center"
              >
                <div className="font-mono text-[11px] leading-[1.4] text-[#AAA49C]">
                  <strong className="block text-xs font-semibold text-[#555]">
                    {formattedLongDate(item.occurredAt)}
                  </strong>
                  <span className="md:hidden">{formatDate(item.occurredAt)}</span>
                </div>

                <div className="truncate text-[13px] font-semibold text-[#111]">
                  {item.category?.name ?? "Без категории"}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={
                      item.type === "EXPENSE"
                        ? "rounded-[5px] border border-[#F5CEC9] bg-[#FEF1EF] px-2 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.8px] text-[#D94F3D]"
                        : "rounded-[5px] border border-[#C2EDD8] bg-[#EDFAF4] px-2 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.8px] text-[#1A9E6A]"
                    }
                  >
                    {item.type === "EXPENSE" ? "Expense" : "Income"}
                  </span>
                  {item.type === "EXPENSE" && item.emotion ? (
                    (() => {
                      const meta = getTransactionEmotionMeta(item.emotion);
                      if (item.emotion === "IMPULSIVE") {
                        return (
                          <span className="inline-flex items-center gap-1 rounded-[5px] border border-[#F3D9A0] bg-[#FEF5E6] px-1.5 py-[2px] font-mono text-[9px] font-semibold text-[#C07C1A]">
                            <span aria-hidden>{meta.emoji}</span>
                            <span>{meta.shortLabel}</span>
                          </span>
                        );
                      }

                      return (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-[#888]">
                          <span aria-hidden>{meta.emoji}</span>
                          <span>{meta.shortLabel}</span>
                        </span>
                      );
                    })()
                  ) : null}
                </div>

                <span className="w-fit rounded-[5px] border border-[#EDEAE4] bg-[#F7F6F3] px-2 py-[2px] font-mono text-[10px] text-[#C0BCB4]">
                  {item.account.currency}
                </span>

                <span
                  className={
                    item.type === "EXPENSE"
                      ? "text-left font-mono text-sm font-semibold tracking-[-0.3px] text-[#D94F3D] md:text-right"
                      : "text-left font-mono text-sm font-semibold tracking-[-0.3px] text-[#1A9E6A] md:text-right"
                  }
                >
                  {item.type === "EXPENSE" ? "−" : "+"}
                  {formatCurrency(item.amount, item.account.currency)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ExportReportsCard
        data={data}
        currency={totalCurrency ?? forecastCurrency}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
