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
      <div className="flex h-full w-full items-center justify-center text-sm text-[#AAA49C]">
        Нет данных по расходам за выбранный период
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="flex shrink-0 items-center justify-center px-6 py-5 lg:w-[220px]">
        <div className="relative h-[170px] w-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="h-full">
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                innerRadius={44}
                outerRadius={72}
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
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xs font-semibold text-[#111]">
              {new Intl.NumberFormat("ru-RU", {
                maximumFractionDigits: 0,
              }).format(total)}
            </span>
            <span className="mt-0.5 text-[9px] text-[#C0BCB4]">расходы · ₸</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 border-l border-[#EDEAE4]">
        <ul>
          {data.map((i) => {
            const percent = total > 0 ? (i.amount / total) * 100 : 0;
            const color = resolveCategoryColor(i.colorKey);

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
                    {percent.toFixed(0)}% от всех расходов
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-semibold text-[#111]">
                    {formatCurrency(i.amount, currency)}
                  </p>
                  <p className="font-mono text-[10px] text-[#C0BCB4]">
                    {percent.toFixed(0)}%
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
