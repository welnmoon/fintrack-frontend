import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import type { DashboardExpensePieItem } from "@/features/get-dashboard/model/types.api";
import { DEFAULT_CATEGORY_COLOR } from "@/shared/const/category";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";
import { formatCurrency } from "@/shared/lib";
import type { LucideIcon } from "lucide-react";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";

const RADIAN = Math.PI / 180;
type PieItem = {
  name: string;
  amount: number;
  iconKey: string | null;
};

function resolveCategoryColor(colorKey: string | null): string {
  if (!colorKey) return DEFAULT_CATEGORY_COLOR;

  try {
    return getCategoryColor(colorKey as CategoryColorKey);
  } catch {
    return DEFAULT_CATEGORY_COLOR;
  }
}

function resolveCategoryIcon(iconKey: string | null): LucideIcon | null {
  if (!iconKey) return null;
  return getCategoryIcon(iconKey as CategoryIconKey) ?? null;
}

function makeIconLabel(getIcon: (key: CategoryIconKey) => LucideIcon) {
  return function IconLabel(props: PieLabelRenderProps) {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } =
      props;

    if (cx == null || cy == null || innerRadius == null || outerRadius == null)
      return null;

    const item = payload as PieItem | undefined;
    const Icon = item ? getIcon(item.iconKey as CategoryIconKey) : null;

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
  const total = data.reduce(
    (sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0),
    0,
  );

  if (!data.length || total <= 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Нет данных по расходам за выбранный период
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 lg:flex-row"
      style={{ width: "100%", maxWidth: 700, alignItems: "stretch" }}
    >
      <div className="h-52 shrink-0 lg:h-full" style={{ flex: "0 0 320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="h-full">
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              labelLine={false}
              label={makeIconLabel(getCategoryIcon)}
              isAnimationActive={isAnimationActive}
            >
              {data.map((i) => (
                <Cell key={i.id} fill={resolveCategoryColor(i.colorKey)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto pr-1">
        <ul className="space-y-3">
          {data.map((i) => {
            const percent = total > 0 ? (i.amount / total) * 100 : 0;
            const color = resolveCategoryColor(i.colorKey);
            const Icon = resolveCategoryIcon(i.iconKey);

            return (
              <li
                key={i.id}
                className="flex items-start gap-3 rounded-2xl border bg-background/80 px-4 py-3"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: `${color}33`,
                    backgroundColor: `${color}14`,
                  }}
                >
                  {Icon ? <Icon size={18} color={color} /> : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="shrink-0 rounded-full"
                      style={{
                        width: 10,
                        height: 10,
                        background: color,
                      }}
                    />
                    <span className="truncate font-medium">{i.name}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(i.amount, currency)}
                    </span>
                    <span className="text-muted-foreground">
                      {percent.toFixed(0)}% от всех расходов
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
