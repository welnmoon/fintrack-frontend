import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import type { DashboardExpensePieItem } from "@/features/get-dashboard/model/types.api";
import { DEFAULT_CATEGORY_COLOR } from "@/shared/const/category";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";
import { cn, formatCurrency } from "@/shared/lib";
import type { LucideIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";

const RADIAN = Math.PI / 180;
const OTHERS_COLOR = "#C8C4BC";

type PieItem = {
  name: string;
  amount: number;
  iconKey: string | null;
};

type LimitOption = 5 | 7 | "all";

function resolveCategoryColor(colorKey: string | null): string {
  if (!colorKey) return DEFAULT_CATEGORY_COLOR;
  try {
    return getCategoryColor(colorKey as CategoryColorKey);
  } catch {
    return DEFAULT_CATEGORY_COLOR;
  }
}

function makeIconLabel(getIcon: (key: CategoryIconKey) => LucideIcon) {
  return function IconLabel(props: PieLabelRenderProps) {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } =
      props;

    if (cx == null || cy == null || innerRadius == null || outerRadius == null)
      return null;

    if ((percent ?? 0) < 0.04) return null;

    const item = payload as PieItem | undefined;
    const isOthers = (item as { id?: string })?.id === "__others__";
    const Icon =
      item && !isOthers ? getIcon(item.iconKey as CategoryIconKey) : null;

    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = Number(cx) + r * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = Number(cy) + r * Math.sin(-(midAngle ?? 0) * RADIAN);
    const size = 14;

    return (
      <g transform={`translate(${x}, ${y})`}>
        {Icon ? (
          <g transform={`translate(${-size / 2}, ${-size / 2})`}>
            {React.createElement(Icon, { size, color: "white" })}
          </g>
        ) : null}
        <text
          x={0}
          y={Icon ? size / 2 + 10 : 0}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
        >
          {`${((percent ?? 0) * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };
}

export default function PieChartWithCustomizedLabel({
  isAnimationActive = true,
  data,
  currency,
}: {
  isAnimationActive?: boolean;
  data: DashboardExpensePieItem[];
  currency?: string;
}) {
  const [limit, setLimit] = useState<LimitOption>(7);

  const displayData = useMemo<DashboardExpensePieItem[]>(() => {
    if (limit === "all" || data.length <= limit) return data;

    const top = data.slice(0, limit);
    const rest = data.slice(limit);
    const othersAmount = rest.reduce((sum, item) => sum + item.amount, 0);

    if (othersAmount <= 0) return top;

    return [
      ...top,
      {
        id: "__others__",
        name: "Другие",
        iconKey: null,
        colorKey: null,
        amount: othersAmount,
      },
    ];
  }, [data, limit]);

  const total = displayData.reduce(
    (sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0),
    0,
  );

  if (!data.length || total <= 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-[#AAA49C]">
        Нет данных по расходам за выбранный период
      </div>
    );
  }

  const limitOptions: LimitOption[] = [5, 7, "all"];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* limit control */}
      {data.length > 5 && (
        <div className="flex shrink-0 items-center gap-2 border-b border-[#EDEAE4] px-4 py-2.5">
          <span className="text-[10px] font-medium text-[#C0BCB4]">
            Категорий:
          </span>
          <div className="flex">
            {limitOptions.map((option, index, arr) => (
              <button
                key={String(option)}
                onClick={() => setLimit(option)}
                className={cn(
                  "h-6 border border-[#DDD9D1] px-3 font-mono text-[10px] font-medium tracking-[0.4px] text-[#AAA49C] transition-colors",
                  index === 0 && "rounded-l-[6px]",
                  index === arr.length - 1
                    ? "rounded-r-[6px]"
                    : "border-r-0",
                  limit === option &&
                    "border-[#111] bg-[#111] text-white",
                )}
              >
                {option === "all" ? "Все" : `Топ ${option}`}
              </button>
            ))}
          </div>
          {data.length > (limit === "all" ? data.length : limit) && (
            <span className="text-[10px] text-[#C0BCB4]">
              +{data.length - (limit === "all" ? data.length : limit)} в «Другие»
            </span>
          )}
        </div>
      )}

      {/* main area */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* pie */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-3 px-6 py-5 lg:w-[240px]">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#AAA49C]">
              Общие расходы
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#111]">
              {formatCurrency(total, currency)}
            </p>
          </div>
          <div className="relative h-[190px] w-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={0}
                  outerRadius={86}
                  labelLine={false}
                  label={makeIconLabel(getCategoryIcon)}
                  isAnimationActive={isAnimationActive}
                >
                  {displayData.map((i) => (
                    <Cell
                      key={i.id}
                      fill={
                        i.id === "__others__"
                          ? OTHERS_COLOR
                          : resolveCategoryColor(i.colorKey)
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* category list — fills all remaining height */}
        <div className="min-h-[320px] overflow-y-auto border-t border-[#EDEAE4] lg:min-h-0 lg:flex-1 lg:border-l lg:border-t-0">
          <ul>
            {displayData.map((i) => {
              const pct = total > 0 ? (i.amount / total) * 100 : 0;
              const color =
                i.id === "__others__"
                  ? OTHERS_COLOR
                  : resolveCategoryColor(i.colorKey);

              return (
                <li
                  key={i.id}
                  className="flex items-center gap-3 border-b border-[#F4F2EE] px-[18px] py-[13px] last:border-b-0 hover:bg-[#FAFAF8]"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#222]">
                      {i.name}
                    </p>
                    <p className="text-[10px] text-[#C0BCB4]">
                      {pct.toFixed(0)}% от всех расходов
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-semibold text-[#111]">
                      {formatCurrency(i.amount, currency)}
                    </p>
                    <p className="font-mono text-[10px] text-[#C0BCB4]">
                      {pct.toFixed(0)}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
