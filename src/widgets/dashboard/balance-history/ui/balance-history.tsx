import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { useBalanceHistory } from "@/features/get-dashboard/api/use-balance-history";
import type {
  BalanceHistoryInterval,
  DashboardBalanceHistoryPoint,
} from "@/features/get-dashboard/model/types.api";
import { cn, formatCurrency } from "@/shared/lib";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { HashLoader } from "react-spinners";

const intervalLabel: Record<BalanceHistoryInterval, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
};

const STROKE = "#10b981";
const GRADIENT_ID = "balanceHistGrad";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAxisLabel(
  point: DashboardBalanceHistoryPoint,
  interval: BalanceHistoryInterval,
) {
  const periodStart = new Date(point.periodStart);
  const periodEnd = new Date(point.periodEnd);

  if (interval === "day") {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    }).format(periodStart);
  }

  if (interval === "week") {
    const s = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    }).format(periodStart);
    const e = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    }).format(periodEnd);
    return `${s}–${e}`;
  }

  return new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(
    periodStart,
  );
}

function formatTooltipDate(
  periodStart: string,
  periodEnd: string,
  interval: BalanceHistoryInterval,
) {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  if (interval === "day") {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(start);
  }

  if (interval === "week") {
    const s = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(start);
    const e = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(end);
    return `${s} — ${e}`;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(start);
}

function formatAxisY(value: number, currency?: string): string {
  const sym =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : "₸";
  const abs = Math.abs(value);
  if (abs >= 1_000_000)
    return `${sym}${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)
    return `${sym}${(value / 1_000).toFixed(0)}K`;
  return `${sym}${value.toFixed(0)}`;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

type ChartPoint = {
  label: string;
  periodStart: string;
  periodEnd: string;
  total: number | null;
};

function BalanceTooltip({
  active,
  payload,
  currency,
  interval,
}: TooltipProps<number, string> & {
  currency?: string;
  interval: BalanceHistoryInterval;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point || point.total == null) return null;

  const isNegative = point.total < 0;

  return (
    <div className="rounded-[10px] border border-[#E5E2D8] bg-white px-4 py-3 shadow-lg">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#B5B0A8]">
        {formatTooltipDate(point.periodStart, point.periodEnd, interval)}
      </p>
      <p
        className={cn(
          "font-mono text-[15px] font-semibold",
          isNegative ? "text-red-500" : "text-[#111]",
        )}
      >
        {formatCurrency(point.total, currency)}
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const BalanceHistory = () => {
  const [interval, setInterval] = useState<BalanceHistoryInterval>("day");
  const { data, isLoading, isError } = useBalanceHistory(interval);

  const chartData: ChartPoint[] = data?.points
    ? data.points.map((point) => ({
        label: formatAxisLabel(point, interval),
        periodStart: point.periodStart,
        periodEnd: point.periodEnd,
        total: point.total,
      }))
    : [];

  const hasNumericPoints = chartData.some((p) => typeof p.total === "number");
  const hasNegative = chartData.some((p) => (p.total ?? 0) < 0);

  // pick stroke / gradient based on whether any point is negative
  const strokeColor = hasNegative ? "#f43f5e" : STROKE;
  const gradStart = hasNegative
    ? "rgba(244,63,94,0.18)"
    : "rgba(16,185,129,0.18)";

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <HashLoader size={28} color="hsl(var(--muted-foreground))" />
          <span className="text-xs">Загрузка динамики...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-destructive">
          Не удалось загрузить динамику баланса
        </div>
      );
    }

    if (!chartData.length) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Нет данных для построения графика
        </div>
      );
    }

    if (!hasNumericPoints) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Недостаточно данных для расчёта динамики
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 16, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradStart} stopOpacity={1} />
              <stop offset="100%" stopColor={gradStart} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#F0EDE7"
          />

          <XAxis
            dataKey="label"
            tick={{
              fill: "#B5B0A8",
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
            }}
            tickLine={false}
            axisLine={false}
            minTickGap={36}
            dy={4}
          />

          <YAxis
            width={62}
            tick={{
              fill: "#B5B0A8",
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatAxisY(Number(v), data?.currency)}
            tickCount={5}
          />

          {hasNegative && (
            <ReferenceLine
              y={0}
              stroke="#E5E2D8"
              strokeWidth={1.5}
              strokeDasharray="0"
            />
          )}

          <Tooltip
            content={
              <BalanceTooltip currency={data?.currency} interval={interval} />
            }
            cursor={{
              stroke: "#E5E2D8",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${GRADIENT_ID})`}
            connectNulls
            isAnimationActive={false}
            dot={false}
            activeDot={{
              r: 4.5,
              fill: strokeColor,
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Tabs
      value={interval}
      onValueChange={(value) => setInterval(value as BalanceHistoryInterval)}
      className="h-full w-full gap-0"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#EDEAE4] px-6 py-3">
        <TabsList className="h-auto rounded-none bg-transparent p-0">
          {(Object.keys(intervalLabel) as BalanceHistoryInterval[]).map(
            (item, index, list) => (
              <TabsTrigger
                key={item}
                value={item}
                className={cn(
                  "h-7 rounded-none border border-[#DDD9D1] bg-transparent px-3.5 font-mono text-[10px] font-medium tracking-[0.5px] text-[#AAA49C]",
                  "data-[state=active]:border-[#111] data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none",
                  index === 0 && "rounded-l-[6px]",
                  index === list.length - 1
                    ? "rounded-r-[6px]"
                    : "border-r-0",
                )}
              >
                {intervalLabel[item]}
              </TabsTrigger>
            ),
          )}
        </TabsList>

        <div className="font-mono text-[10px] tracking-[0.5px] text-[#C0BCB4]">
          {data?.currency ?? "KZT"}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-2 pb-4 pt-2">{renderContent()}</div>

      {data?.fxUnavailable ? (
        <p className="border-t border-[#EDEAE4] px-6 py-2.5 text-xs text-[#AAA49C]">
          FX недоступен — график показан без полной конвертации валют.
        </p>
      ) : data?.fxStale ? (
        <p className="border-t border-[#EDEAE4] px-6 py-2.5 text-xs text-[#AAA49C]">
          Используются последние сохранённые курсы FX.
        </p>
      ) : null}
    </Tabs>
  );
};

export default BalanceHistory;
