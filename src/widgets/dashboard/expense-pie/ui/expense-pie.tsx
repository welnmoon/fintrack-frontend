import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import type { DashboardExpensePieItem } from "@/features/get-dashboard/model/types.api";
import { DEFAULT_CATEGORY_COLOR } from "@/shared/const/category";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";
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
}: {
  isAnimationActive?: boolean;
  data: DashboardExpensePieItem[];
}) {
  const total = data.reduce(
    (sum, i) => sum + (Number.isFinite(i.amount) ? i.amount : 0),
    0,
  );
  return (
    <div
      className="flex gap-4 h-full min-h-0"
      style={{ width: "100%", maxWidth: 700, alignItems: "stretch" }}
    >
      <div style={{ flex: "0 0 320px" }}>
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

      <div className="flex-1 min-w-0 p-8 overflow-y-auto">
        <ul className="space-y-2">
          {data.map((i) => {
            const percent = total > 0 ? (i.amount / total) * 100 : 0;
            const color = resolveCategoryColor(i.colorKey);
            const Icon = resolveCategoryIcon(i.iconKey);

            return (
              <li
                key={i.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: color,
                      flex: "0 0 auto",
                    }}
                  />
                  {Icon ? <Icon size={14} color={color} /> : null}
                  <span className="truncate">{i.name}</span>
                </div>

                <div className="flex items-baseline gap-2 flex-shrink-0">
                  <span>{i.amount}</span>
                  <span className="text-xs opacity-70">
                    {percent.toFixed(0)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
