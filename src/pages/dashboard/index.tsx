import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Link, useNavigate, useRoutes } from "react-router-dom";
import { RotateCw } from "lucide-react";
import type { FinancialInsight } from "@/features/get-dashboard/model/types.api";
import { formatCurrency } from "@/shared/lib";
import { useGetDashboard } from "@/features/get-dashboard/api/use-get-dashboard";
import { useExpensePie } from "@/features/get-dashboard/api/use-expense-pie";
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
import { localizeText } from "@/shared/lib/category/display-category-name";
import { USER_PLAN } from "@/shared/model/plan";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import PieChartWithCustomizedLabel from "@/widgets/dashboard/expense-pie/ui/expense-pie";
import BalanceHistory from "@/widgets/dashboard/balance-history/ui/balance-history";
import PriceChart from "@/widgets/dashboard/forex-chart/ui/forex-chart";
import { DateRangePicker } from "@/widgets/dashboard/expense-pie/ui/date-range-picker";
import { EmotionSummaryCard } from "@/widgets/dashboard/emotion-summary/ui/emotion-summary-card";
import { ForecastCard } from "@/widgets/dashboard/forecast/ui/forecast-card";

const insightTypeConfig = {
  warning: {
    accentColor: "#D48E0E",
    iconBg: "bg-[#FEF5E0]",
    badgeBg: "bg-[#FEF0C8]",
    badgeBorder: "border-[#F5D888]",
    badgeText: "text-[#8A5A08]",
    badgeLabel: "Внимание",
    chipBg: "bg-[#FEF5E0]",
    chipText: "text-[#8A5A08]",
    chipDot: "bg-[#D48E0E]",
    numColor: "text-[#C07010]",
    miniBarFill: "bg-[#D48E0E]",
    chipCount: (n: number) => `${n} внимани${n === 1 ? "е" : "я"}`,
  },
  positive: {
    accentColor: "#52B866",
    iconBg: "bg-[#E8F5EC]",
    badgeBg: "bg-[#D8F0DE]",
    badgeBorder: "border-[#A8DCBA]",
    badgeText: "text-[#256030]",
    badgeLabel: "Хорошо",
    chipBg: "bg-[#E8F5EC]",
    chipText: "text-[#266834]",
    chipDot: "bg-[#52B866]",
    numColor: "text-[#3A9A52]",
    miniBarFill: "bg-[#52B866]",
    chipCount: (n: number) => `${n} хорошо`,
  },
  info: {
    accentColor: "#5882C8",
    iconBg: "bg-[#EBF1F9]",
    badgeBg: "bg-[#DDE8F6]",
    badgeBorder: "border-[#A8C0E8]",
    badgeText: "text-[#274E82]",
    badgeLabel: "Инфо",
    chipBg: "bg-[#EBF1F9]",
    chipText: "text-[#274E82]",
    chipDot: "bg-[#5882C8]",
    numColor: "text-[#3060A8]",
    miniBarFill: "bg-[#5882C8]",
    chipCount: (n: number) => `${n} инфо`,
  },
} as const;

function insightWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "инсайт";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100))
    return "инсайта";
  return "инсайтов";
}

function extractPercent(text: string): number | null {
  const m = text.match(/(\d+(?:[,\.]\d+)?)\s*%/);
  if (!m) return null;
  const v = parseFloat(m[1].replace(",", "."));
  return isNaN(v) ? null : Math.min(v, 100);
}

function extractDays(text: string): number | null {
  const m = text.match(/на\s+(\d+)\s+дн/);
  if (!m) return null;
  return parseInt(m[1]);
}

function InsightIcon({
  type,
  title,
}: {
  type: FinancialInsight["type"];
  title: string;
}) {
  const t = title.toLowerCase();
  const warnC = "#D48E0E";
  const goodC = "#3A9A52";
  const infoC = "#5882C8";
  const c = type === "warning" ? warnC : type === "positive" ? goodC : infoC;

  if (t.includes("концентрация") || t.includes("крупнейшая")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
        <path d="M12 12L12 3A9 9 0 0 1 21 12Z" fill={c} opacity="0.25" />
        <path d="M12 12L21 12A9 9 0 0 1 3.7 17.3Z" fill={c} opacity="0.5" />
        <path d="M12 12L3.7 17.3A9 9 0 0 1 12 3Z" fill={c} />
        <circle cx="12" cy="12" r="2.5" fill="white" />
      </svg>
    );
  }
  if (t.includes("импульсив")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <path
          d="M13.5 2.5L5.5 13.5H11.5L10.5 21.5L18.5 10.5H12.5L13.5 2.5Z"
          fill={c}
        />
      </svg>
    );
  }
  if (
    t.includes("стабильный") ||
    (t.includes("запас") && type === "positive")
  ) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <path
          d="M4 17L9 11L13 14.5L20 7"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 7H20V11"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 20H21"
          stroke={c}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    );
  }
  if (t.includes("ожидаемые") || t.includes("до конца")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="3"
          stroke={c}
          strokeWidth="1.8"
        />
        <path d="M3 9H21" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M8 3V7M16 3V7"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="15" r="2" fill={c} opacity="0.5" />
      </svg>
    );
  }
  if (t.includes("низкий")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          stroke={c}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line
          x1="12"
          y1="9"
          x2="12"
          y2="13"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="17"
          x2="12.01"
          y2="17"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
      <path d="M12 8v1" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12v4" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function InsightExtra({
  description,
  type,
}: {
  description: string;
  type: FinancialInsight["type"];
}) {
  const cfg = insightTypeConfig[type];

  const pct = extractPercent(description);
  if (pct !== null) {
    return (
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-[5px] w-[120px] overflow-hidden rounded-full bg-[#F0EDE5]">
          <div
            className={`h-full rounded-full ${cfg.miniBarFill}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[12px] font-medium text-[#4A4A45]">
          {pct.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%
        </span>
      </div>
    );
  }

  const days = extractDays(description);
  if (days !== null) {
    return (
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={`font-mono text-[18px] font-normal leading-none tracking-[-0.02em] ${cfg.numColor}`}
        >
          {days}
        </span>
        <span className="text-[12px] text-[#A09E96]">дн. запаса</span>
      </div>
    );
  }

  return null;
}

function FinancialInsightsBlock({
  insights,
  isLoading,
}: {
  insights?: FinancialInsight[];
  isLoading?: boolean;
}) {
  const warnCount = insights?.filter((i) => i.type === "warning").length ?? 0;
  const goodCount = insights?.filter((i) => i.type === "positive").length ?? 0;
  const infoCount = insights?.filter((i) => i.type === "info").length ?? 0;
  const total = insights?.length ?? 0;

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E5E2D8] bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D8] px-8 py-5">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C1B18]">
            Финансовые инсайты
          </span>
          <span className="text-[12px] text-[#A09E96]">
            Короткие выводы на основе расходов, прогноза и эмоциональных меток
          </span>
        </div>
        {!isLoading && total > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {warnCount > 0 && (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium ${insightTypeConfig.warning.chipBg} ${insightTypeConfig.warning.chipText}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${insightTypeConfig.warning.chipDot}`}
                />
                {insightTypeConfig.warning.chipCount(warnCount)}
              </div>
            )}
            {goodCount > 0 && (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium ${insightTypeConfig.positive.chipBg} ${insightTypeConfig.positive.chipText}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${insightTypeConfig.positive.chipDot}`}
                />
                {insightTypeConfig.positive.chipCount(goodCount)}
              </div>
            )}
            {infoCount > 0 && (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium ${insightTypeConfig.info.chipBg} ${insightTypeConfig.info.chipText}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${insightTypeConfig.info.chipDot}`}
                />
                {insightTypeConfig.info.chipCount(infoCount)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="py-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-8 py-4">
              <Skeleton className="h-10 w-10 flex-shrink-0 rounded-[11px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-44" />
                <Skeleton className="h-3 w-72" />
              </div>
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : !insights?.length ? null : (
        <div className="py-3">
          {insights.map((insight, index) => {
            const cfg = insightTypeConfig[insight.type];
            return (
              <div
                key={index}
                className="relative grid grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-[#F5F3EE] px-8 py-4 transition-colors last:border-b-0 hover:bg-[#FAFAF7]"
              >
                {/* Left accent stripe */}
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] min-h-[28px] rounded-r-[3px]"
                  style={{
                    height: "40%",
                    backgroundColor: cfg.accentColor,
                  }}
                />
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] ${cfg.iconBg}`}
                >
                  <InsightIcon type={insight.type} title={insight.title} />
                </div>
                {/* Body */}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug tracking-[-0.01em] text-[#1C1B18]">
                    {insight.title}
                  </p>
                  <p className="mt-[3px] text-[13px] leading-[1.45] text-[#7A7971]">
                    {localizeText(insight.description)}
                  </p>
                  <InsightExtra
                    description={insight.description}
                    type={insight.type}
                  />
                </div>
                {/* Badge */}
                <span
                  className={`flex-shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}
                >
                  {cfg.badgeLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between border-t border-[#E5E2D8] px-8 py-3.5">
          <span className="text-[12px] text-[#B0ADA4]">
            {total} {insightWord(total)} на основе данных текущего месяца
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#C0BDB4]">
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 opacity-70">
              <path
                d="M13.5 8A5.5 5.5 0 1 1 8 2.5"
                stroke="#B0ADA4"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M8 2.5L11 5.5M8 2.5L5 5.5"
                stroke="#B0ADA4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Обновлено сегодня
          </span>
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

  const {
    data,
    isLoading,
    isError,
    refetch: refetchDashboard,
  } = useGetDashboard();
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

  const expensePieData = expensePieQuery.data;
  const expensePieItems = expensePieData?.items ?? [];
  const expensePieCurrency =
    expensePieData?.currency ??
    data?.expensePie.currency ??
    totalCurrency ??
    "KZT";
  const expensePieFxUnavailable = expensePieData?.fxUnavailable ?? false;
  const expensePieFxStale = expensePieData?.fxStale ?? false;
  const expensePieLoading = expensePieQuery.isLoading;
  const expensePieError = expensePieQuery.isError;
  const forecast = data?.forecast;
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
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.reports}
              className="inline-flex items-center rounded-[7px] border border-[#DDD9D1] px-2.5 py-1.5 font-mono text-[11px] text-[#B5B0A8] transition-colors hover:bg-white hover:text-[#555]"
            >
              Отчёты →
            </Link>
            <button
              type="button"
              onClick={() => {
                void refetchDashboard();
                void expensePieQuery.refetch();
              }}
              className="inline-flex items-center rounded-[7px] border border-[#DDD9D1] px-2.5 py-1.5 font-mono text-[11px] text-[#B5B0A8] transition-colors hover:bg-white hover:text-[#555]"
              aria-label="Обновить данные"
            >
              <RotateCw
                onClick={() => window.location.reload()}
                className="h-3.5 w-3.5"
              />
            </button>
          </div>
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

      <ForecastCard
        forecast={forecast}
        isLoading={isLoading}
        isError={isError}
      />

      <EmotionSummaryCard
        summary={data?.emotionsSummary}
        isLoading={isLoading}
        isError={isError}
      />

      {USER_PLAN !== "FREE" ? (
        <FinancialInsightsBlock
          insights={data?.insights}
          isLoading={isLoading}
        />
      ) : null}

      <Card className="overflow-hidden border-[#DDD9D1]">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 xl:grid-cols-2">
            <div className="flex h-[460px] flex-col border-b border-[#EDEAE4] xl:border-r xl:border-b-0">
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

            <div className="flex h-[680px] flex-col md:h-[720px] xl:h-[460px]">
              <div className="border-b border-[#EDEAE4] px-6 py-4">
                <div className="mb-0.5 text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
                  Структура расходов
                </div>
                <div className="text-[11px] text-[#B5B0A8]">
                  Круговая диаграмма расходов по категориям ·{" "}
                  {expensePieCurrency}
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
        <CardHeader className="flex flex-col gap-3 border-b border-[#EDEAE4] px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
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
    </PageContainer>
  );
}
