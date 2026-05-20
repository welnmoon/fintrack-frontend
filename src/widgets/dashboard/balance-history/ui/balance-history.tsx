import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
    const startLabel = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
    }).format(periodStart);
    const endLabel = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
    }).format(periodEnd);

    return `${startLabel} - ${endLabel}`;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    month: "short",
  }).format(periodStart);
}

function formatTooltipLabel(
  periodStart: string,
  periodEnd: string,
  interval: BalanceHistoryInterval,
) {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  if (interval === "day") {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(start);
  }

  if (interval === "week") {
    const startText = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
    }).format(start);
    const endText = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(end);
    return `${startText} - ${endText}`;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(start);
}

function formatCompactCurrency(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency ?? "KZT",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
}

const BalanceHistory = () => {
  const [interval, setInterval] = useState<BalanceHistoryInterval>("day");
  const { data, isLoading, isError } = useBalanceHistory(interval);

  const chartData = data?.points
    ? data.points.map((point) => ({
        label: formatAxisLabel(point, interval),
        periodStart: point.periodStart,
        periodEnd: point.periodEnd,
        total: point.total,
      }))
    : [];

  const hasNumericPoints = chartData.some(
    (point) => typeof point.total === "number",
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <HashLoader size={32} color="hsl(var(--muted-foreground))" />
          <span>Загрузка динамики...</span>
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
          Недостаточно данных для расчета единой валютной динамики
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 16,
            right: 6,
            left: 0,
            bottom: 0,
          }}
          onContextMenu={(_, e) => e.preventDefault()}
        >
          <defs>
            <linearGradient id="balanceHistoryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" minTickGap={24} />
          <YAxis
            width={82}
            tickFormatter={(value) =>
              formatCompactCurrency(Number(value), data?.currency)
            }
          />
          <Tooltip
            formatter={(value: number | string | undefined) => {
              const numericValue =
                typeof value === "number" ? value : Number(value);
              if (!Number.isFinite(numericValue))
                return ["N/A", "Баланс"] as const;
              return [
                formatCurrency(numericValue, data?.currency),
                "Баланс",
              ] as const;
            }}
            labelFormatter={(_, payload) => {
              const payloadItem = payload?.[0]?.payload as
                | { periodStart?: string; periodEnd?: string }
                | undefined;
              if (!payloadItem?.periodStart || !payloadItem?.periodEnd) {
                return "";
              }

              return formatTooltipLabel(
                payloadItem.periodStart,
                payloadItem.periodEnd,
                interval,
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#balanceHistoryFill)"
            connectNulls
            isAnimationActive={false}
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

      <div className="min-h-0 flex-1 px-3 pb-3 pt-3">{renderContent()}</div>

      {data?.fxUnavailable ? (
        <p className="border-t border-[#EDEAE4] px-6 py-2.5 text-xs text-[#AAA49C]">
          FX недоступен. График показан в fallback-режиме без полной конвертации
          валют.
        </p>
      ) : data?.fxStale ? (
        <p className="border-t border-[#EDEAE4] px-6 py-2.5 text-xs text-[#AAA49C]">
          Используются последние сохраненные курсы FX. Данные могут быть не
          актуальны.
        </p>
      ) : null}
    </Tabs>
  );
};

export default BalanceHistory;
