import { useState } from "react";
import type { TransactionEmotion } from "@/entities/transaction";
import { getTransactionEmotionMeta } from "@/entities/transaction";
import type { DashboardEmotionsSummary } from "@/features/get-dashboard/model/types.api";
import { displayCategoryName } from "@/shared/lib/category/display-category-name";
import { formatCurrency } from "@/shared/lib";
import { cn } from "@/shared/lib";
import {
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";

type EmotionSummaryCardProps = {
  summary?: DashboardEmotionsSummary;
  isLoading?: boolean;
  isError?: boolean;
};

const tabTriggerClass =
  "mb-[-1px] h-auto rounded-none border-b-2 border-b-transparent px-4 pb-[10px] pt-0 text-[13px] font-medium text-[#A09E96] transition-colors hover:text-[#1C1B18] data-[state=active]:border-b-[#1C1B18] data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[#1C1B18] data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0";

/* Inline SVG icons for each emotion */
const ImpulsiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M13.5 2L5 14h6.5L10 22l9.5-12H13L13.5 2Z" fill="#D48E0E" />
  </svg>
);
const RegretIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M9.5 7L5.5 11l4 4" stroke="#7C4ABF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 11h9a5 5 0 0 1 0 10H11" stroke="#7C4ABF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const StressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M2 13L5.5 7 9 15l4-9 4 10 3-6" stroke="#C53030" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const NeutralIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
    <circle cx="12" cy="12" r="9" stroke="#8A8880" strokeWidth="2" />
    <circle cx="9.5" cy="10.5" r="1" fill="#8A8880" />
    <circle cx="14.5" cy="10.5" r="1" fill="#8A8880" />
    <line x1="9" y1="15" x2="15" y2="15" stroke="#8A8880" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const HappyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
    <circle cx="12" cy="12" r="9" stroke="#3A9A52" strokeWidth="2" />
    <circle cx="9.5" cy="10.5" r="1" fill="#3A9A52" />
    <circle cx="14.5" cy="10.5" r="1" fill="#3A9A52" />
    <path d="M9 14.5c.8 1.5 5.2 1.5 6 0" stroke="#3A9A52" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const emotionIconMap: Record<TransactionEmotion, React.ReactNode> = {
  IMPULSIVE: <ImpulsiveIcon />,
  REGRET: <RegretIcon />,
  STRESS: <StressIcon />,
  NEUTRAL: <NeutralIcon />,
  HAPPY: <HappyIcon />,
};

const emotionIconBg: Record<TransactionEmotion, string> = {
  IMPULSIVE: "bg-[#FEF5E0]",
  REGRET: "bg-[#F2EDFC]",
  STRESS: "bg-[#F7ECEC]",
  NEUTRAL: "bg-[#F0EEE8]",
  HAPPY: "bg-[#E8F5EC]",
};

const emotionBarColor: Record<TransactionEmotion, string> = {
  IMPULSIVE: "#E8A020",
  REGRET: "#9B6ED8",
  STRESS: "#D85050",
  NEUTRAL: "#B0ADA4",
  HAPPY: "#52B866",
};

const emotionLabel: Record<TransactionEmotion, string> = {
  IMPULSIVE: "Импульсивно",
  REGRET: "Сожаление",
  STRESS: "Стресс",
  NEUTRAL: "Нейтрально",
  HAPPY: "Хорошее",
};

const chipConfig: Array<{
  emotion: TransactionEmotion;
  label: string;
  activeClass: string;
}> = [
  {
    emotion: "IMPULSIVE",
    label: "⚡ Импульсивно",
    activeClass: "bg-[#FEF5E0] border-[#E8A020] text-[#8A5A08]",
  },
  {
    emotion: "REGRET",
    label: "↩ Сожаление",
    activeClass: "bg-[#F2EDFC] border-[#9B6ED8] text-[#5A2E9A]",
  },
  {
    emotion: "NEUTRAL",
    label: "— Нейтрально",
    activeClass: "bg-[#F0EEE8] border-[#C0BDB4] text-[#5A5850]",
  },
  {
    emotion: "HAPPY",
    label: "✦ Хорошее",
    activeClass: "bg-[#E8F5EC] border-[#52B866] text-[#266834]",
  },
];

function formatOperationWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return "операция";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
    return "операции";
  return "операций";
}

function formatShare(share: number) {
  return `${share.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

export function EmotionSummaryCard({
  summary,
  isLoading = false,
  isError = false,
}: EmotionSummaryCardProps) {
  const [selectedEmotion, setSelectedEmotion] =
    useState<TransactionEmotion>("IMPULSIVE");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-8">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 grid-cols-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !summary) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-8">
            <div className="rounded-xl border border-dashed p-4 text-sm text-destructive">
              Не удалось загрузить эмоциональную аналитику.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxEmotionCount = Math.max(
    ...summary.emotionDistribution.map((e) => e.count),
    1,
  );

  const riskShare =
    summary.impulsiveExpenseShare +
    summary.regretExpenseShare +
    summary.stressShareByAmount;
  const safeShare = Math.max(0, 100 - riskShare);

  const riskLabel =
    riskShare < 15
      ? "Низкий"
      : riskShare < 35
        ? "Умеренный"
        : riskShare < 60
          ? "Высокий"
          : "Критический";

  const dotTotal = Math.min(Math.max(summary.totalExpensesCount, 1), 10);
  const dotTagged = Math.min(
    Math.round((dotTotal * summary.markedExpensesPercent) / 100),
    dotTotal,
  );
  const dotUntagged = dotTotal - dotTagged;

  const filteredCategories = summary.topEmotionCategories.filter(
    (c) => c.emotion === selectedEmotion,
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-[20px] border border-[#E5E2D8] bg-white">
          <Tabs defaultValue="brief" className="gap-0">
            {/* Header + tabs */}
            <div className="px-8 pt-6 pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C1B18]">
                    Эмоциональный фон расходов
                  </p>
                  <p className="mt-[2px] text-[12px] text-[#A09E96]">
                    Срез по импульсивным, стрессовым и нежелательным покупкам
                  </p>
                </div>
                <span className="mt-[2px] flex-shrink-0 rounded-lg border border-[#E5E2D8] bg-[#F2F0EA] px-3 py-[5px] text-[12px] font-medium text-[#7A7971]">
                  {summary.periodLabel}
                </span>
              </div>
              <div className="mt-5 border-b border-[#E5E2D8]">
                <TabsList className="h-auto gap-0 rounded-none bg-transparent p-0">
                  <TabsTrigger value="brief" className={tabTriggerClass}>
                    Кратко
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className={tabTriggerClass}>
                    Подробно
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* ===== КРАТКО ===== */}
            <TabsContent value="brief" className="mt-0">
              {/* 3 KPI cards */}
              <div className="grid grid-cols-1 gap-0 px-8 pt-8 pb-0 md:grid-cols-[1fr_1px_1fr_1px_1fr]">
                {/* Импульсивные */}
                <div className="pb-6 md:pb-0 md:pr-8">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF5E0]">
                    <ImpulsiveIcon />
                  </div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B87A0A]">
                    Импульсивные
                  </p>
                  <p className="font-mono text-[36px] font-light leading-none tracking-[-0.04em] text-[#D48E0E]">
                    {summary.impulsiveCount}
                  </p>
                  <p className="mt-1 font-mono text-[15px] font-medium text-[#1C1B18]">
                    {formatCurrency(summary.impulsiveAmount, summary.currency)}
                  </p>
                  <p className="text-[12px] text-[#A09E96]">
                    {formatShare(summary.impulsiveExpenseShare)} расходов
                  </p>
                </div>

                <div className="hidden bg-[#E5E2D8] md:block my-4" />

                {/* Сожаление */}
                <div className="border-t border-[#E5E2D8] pt-6 pb-6 md:border-t-0 md:px-8 md:pb-0 md:pt-0">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2EDFC]">
                    <RegretIcon />
                  </div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B3DB0]">
                    Сожаление
                  </p>
                  <p className="font-mono text-[36px] font-light leading-none tracking-[-0.04em] text-[#7C4ABF]">
                    {summary.regretCount}
                  </p>
                  <p className="mt-1 font-mono text-[15px] font-medium text-[#1C1B18]">
                    {formatCurrency(summary.regretAmount, summary.currency)}
                  </p>
                  <p className="text-[12px] text-[#A09E96]">
                    {formatShare(summary.regretExpenseShare)} расходов
                  </p>
                </div>

                <div className="hidden bg-[#E5E2D8] md:block my-4" />

                {/* Стресс */}
                <div className="border-t border-[#E5E2D8] pt-6 md:border-t-0 md:pl-8 md:pt-0">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7ECEC]">
                    <StressIcon />
                  </div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B03030]">
                    Стресс
                  </p>
                  <p
                    className={cn(
                      "font-mono text-[36px] font-light leading-none tracking-[-0.04em] text-[#C53030]",
                      summary.stressCount === 0 && "opacity-35",
                    )}
                  >
                    {summary.stressCount}
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-mono text-[15px] font-medium",
                      summary.stressCount === 0
                        ? "text-[#C0BDB4]"
                        : "text-[#1C1B18]",
                    )}
                  >
                    {formatCurrency(summary.stressAmount, summary.currency)}
                  </p>
                  <p className="text-[12px] text-[#A09E96]">
                    {formatShare(summary.stressShareByAmount)} расходов
                  </p>
                </div>
              </div>

              {/* Risk bar */}
              <div className="px-8 pt-6 pb-0">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B0ADA4]">
                    Поведенческий риск · по сумме трат
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#A09E96]">
                      {Math.round(riskShare)}% в риск-зоне
                    </span>
                    <span className="rounded-[6px] bg-[#FEF0C8] px-2 py-[3px] font-mono text-[12px] font-semibold text-[#8A6020]">
                      {riskLabel}
                    </span>
                  </div>
                </div>
                <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-[#F0EDE5]">
                  {summary.impulsiveExpenseShare > 0 && (
                    <div
                      className="h-full rounded-[3px] bg-[#E8A020]"
                      style={{ width: `${summary.impulsiveExpenseShare}%` }}
                    />
                  )}
                  {summary.regretExpenseShare > 0 && (
                    <div
                      className="h-full rounded-[3px] bg-[#9B6ED8]"
                      style={{ width: `${summary.regretExpenseShare}%` }}
                    />
                  )}
                  {summary.stressShareByAmount > 0 && (
                    <div
                      className="h-full rounded-[3px] bg-[#D85050]"
                      style={{ width: `${summary.stressShareByAmount}%` }}
                    />
                  )}
                  {safeShare > 0 && (
                    <div
                      className="h-full rounded-[3px] bg-[#D8D4C8]"
                      style={{ width: `${safeShare}%` }}
                    />
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-4">
                  {[
                    { color: "#E8A020", label: `Импульсивно · ${formatCurrency(summary.impulsiveAmount, summary.currency)}` },
                    { color: "#9B6ED8", label: `Сожаление · ${formatCurrency(summary.regretAmount, summary.currency)}` },
                    { color: "#D8D4C8", label: "Остальное" },
                  ].map(({ color, label }) => (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 text-[11px] text-[#B0ADA4]"
                    >
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-[2px]"
                        style={{ backgroundColor: color }}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Coverage dots */}
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E5E2D8] px-8 py-5">
                <div className="flex gap-1">
                  {Array.from({ length: dotTagged }).map((_, i) => (
                    <div key={`t-${i}`} className="h-1.5 w-7 rounded-full bg-[#1C1B18]" />
                  ))}
                  {Array.from({ length: dotUntagged }).map((_, i) => (
                    <div key={`u-${i}`} className="h-1.5 w-7 rounded-full bg-[#E5E2D8]" />
                  ))}
                </div>
                <p className="text-[13px] text-[#7A7971]">
                  Эмоцией отмечено{" "}
                  <strong className="text-[#1C1B18]">
                    {summary.markedExpensesCount} из {summary.totalExpensesCount}
                  </strong>{" "}
                  расходов
                </p>
                <span className="ml-auto rounded-lg bg-[#F2F0EA] px-2.5 py-1 font-mono text-[12px] font-medium text-[#8A8880]">
                  {formatShare(summary.markedExpensesPercent)} размечено
                </span>
              </div>
            </TabsContent>

            {/* ===== ПОДРОБНО ===== */}
            <TabsContent value="detailed" className="mt-0">
              {summary.markedExpensesCount === 0 ? (
                <div className="px-8 py-10 text-center">
                  <p className="text-[14px] font-medium text-[#7A7971]">
                    Нет данных для детального анализа
                  </p>
                  <p className="mt-1 text-[12px] text-[#A09E96]">
                    Добавьте эмоциональные метки к расходам, чтобы увидеть
                    распределение и топ-категории.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-0 lg:grid-cols-[3fr_1px_2fr]">
                  {/* Left: distribution bars */}
                  <div className="px-8 py-6">
                    <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B0ADA4]">
                      Распределение эмоций
                    </p>
                    {summary.emotionDistribution.map((item) => {
                      const widthPct =
                        maxEmotionCount > 0
                          ? Math.max(
                              (item.count / maxEmotionCount) * 90,
                              item.count > 0 ? 8 : 0,
                            )
                          : 0;
                      return (
                        <div
                          key={item.emotion}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border-b border-[#F0EDE5] py-2.5 last:border-b-0 hover:bg-[#FAFAF7]"
                          onClick={() =>
                            setSelectedEmotion(item.emotion)
                          }
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                              emotionIconBg[item.emotion],
                            )}
                          >
                            {emotionIconMap[item.emotion]}
                          </div>
                          <span className="min-w-[100px] text-[13px] text-[#4A4A45]">
                            {emotionLabel[item.emotion]}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0EDE5]">
                            <div
                              className="h-full rounded-full transition-[width] duration-500 ease-out"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor:
                                  emotionBarColor[item.emotion],
                              }}
                            />
                          </div>
                          <span className="w-5 flex-shrink-0 text-right font-mono text-[13px] font-medium text-[#1C1B18]">
                            {item.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vertical divider */}
                  <div className="hidden bg-[#E5E2D8] lg:block my-4" />

                  {/* Right: category filter */}
                  <div className="border-t border-[#E5E2D8] px-8 py-6 lg:border-t-0">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B0ADA4]">
                      Топ категорий ·{" "}
                      {emotionLabel[selectedEmotion]}
                    </p>

                    {/* Chip filter */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {chipConfig.map(({ emotion, label, activeClass }) => (
                        <button
                          key={emotion}
                          type="button"
                          onClick={() => setSelectedEmotion(emotion)}
                          className={cn(
                            "rounded-lg border border-[#E5E2D8] px-2.5 py-1 text-[11px] font-medium text-[#8A8880] transition-all hover:border-[#C0BDB4] hover:text-[#4A4A45]",
                            selectedEmotion === emotion && activeClass,
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Category entries */}
                    {filteredCategories.length === 0 ? (
                      <p className="text-[13px] text-[#A09E96]">
                        Нет данных по этой категории.
                      </p>
                    ) : (
                      filteredCategories.map((item) => {
                        const meta = getTransactionEmotionMeta(item.emotion);
                        return (
                          <div
                            key={item.categoryId}
                            className="border-b border-[#F0EDE5] py-3 last:border-b-0"
                          >
                            <div className="mb-0.5 flex items-center justify-between">
                              <span className="text-[14px] font-medium text-[#1C1B18]">
                                {displayCategoryName(item.categoryName)}
                              </span>
                              <span className="font-mono text-[14px] font-medium text-[#1C1B18]">
                                {formatCurrency(item.amount, summary.currency)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] text-[#A09E96]">
                                {item.count}{" "}
                                {formatOperationWord(item.count)}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#FEF5E0] px-2 py-[2px] text-[11px] font-medium text-[#8A5A08]">
                                <span>{meta.emoji}</span>
                                <span>{meta.shortLabel}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* FX notes */}
          {summary.fxUnavailable ? (
            <p className="border-t border-[#E5E2D8] px-8 py-3 text-[11px] text-[#A09E96]">
              FX недоступен: суммы показаны без полной конвертации.
            </p>
          ) : summary.fxStale ? (
            <p className="border-t border-[#E5E2D8] px-8 py-3 text-[11px] text-[#A09E96]">
              Используются последние сохранённые курсы. Данные могут быть не актуальны.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
