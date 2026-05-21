import type { TransactionEmotion } from "@/entities/transaction";
import { getTransactionEmotionMeta } from "@/entities/transaction";
import type { DashboardEmotionsSummary } from "@/features/get-dashboard/model/types.api";
import { formatCurrency } from "@/shared/lib";
import { Card, CardContent, Skeleton } from "@/shared/ui";

type EmotionSummaryCardProps = {
  summary?: DashboardEmotionsSummary;
  isLoading?: boolean;
  isError?: boolean;
};

const emotionBarColorMap: Record<TransactionEmotion, string> = {
  NEUTRAL: "#BBBDB8",
  HAPPY: "#1A9E6A",
  IMPULSIVE: "#E8A020",
  STRESS: "#D94F3D",
  REGRET: "#7B5EA7",
};

const emotionTagClassMap: Record<TransactionEmotion, string> = {
  NEUTRAL: "border-[#E6E3DC] bg-[#F7F6F3] text-[#888]",
  HAPPY: "border-[#C2EDD8] bg-[#EDFAF4] text-[#1A9E6A]",
  IMPULSIVE: "border-[#F3D9A0] bg-[#FEF5E6] text-[#C07C1A]",
  STRESS: "border-[#F5CEC9] bg-[#FEF1EF] text-[#D94F3D]",
  REGRET: "border-[#DDCFEF] bg-[#F5F0FC] text-[#7B5EA7]",
};

function formatExpenseShare(share: number) {
  return `${share.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}% расходов`;
}

function formatOperationWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return "операция";

  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return "операции";
  }

  return "операций";
}

export function EmotionSummaryCard({
  summary,
  isLoading = false,
  isError = false,
}: EmotionSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-72" />
            <div className="grid gap-3 md:grid-cols-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
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
          <div className="p-6">
            <div className="rounded-xl border border-dashed p-4 text-sm text-destructive">
              Не удалось загрузить эмоциональную аналитику.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxEmotionCount = summary.emotionDistribution.reduce(
    (max, item) => Math.max(max, item.count),
    0,
  );
  const hasMarkedExpenses = summary.markedExpensesCount > 0;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-[14px] border border-[#DDD9D1] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EDEAE4] px-6 py-4">
            <div className="min-w-0">
              <span className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
                Эмоциональный фон расходов
              </span>
              <p className="text-xs text-[#B5B0A8]">
                Быстрый срез по импульсивным, стрессовым и нежелательным
                покупкам
              </p>
            </div>
            <span className="inline-flex items-center rounded-[6px] border border-[#EDEAE4] bg-[#F7F6F3] px-[11px] py-[5px] font-mono text-[10px] text-[#888]">
              Период: {summary.periodLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 border-b border-[#EDEAE4] md:grid-cols-3">
            <div className="border-b border-[#EDEAE4] px-6 py-[18px] md:border-r md:border-b-0">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.8px] text-[#AAA49C]">
                Импульсивные траты
              </p>
              <div className="mb-1 flex items-baseline gap-2.5">
                <span className="font-mono text-4xl font-bold leading-none tracking-[-2px] text-[#C07C1A]">
                  {summary.impulsiveCount}
                </span>
                <div className="pb-0.5">
                  <p className="font-mono text-xs font-medium text-[#888]">
                    {formatCurrency(summary.impulsiveAmount, summary.currency)}
                  </p>
                  <p className="text-[11px] text-[#C0BCB4]">
                    {formatExpenseShare(summary.impulsiveExpenseShare)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-[#EDEAE4] px-6 py-[18px] md:border-r md:border-b-0">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.8px] text-[#AAA49C]">
                Сожаление после покупки
              </p>
              <div className="mb-1 flex items-baseline gap-2.5">
                <span className="font-mono text-4xl font-bold leading-none tracking-[-2px] text-[#7B5EA7]">
                  {summary.regretCount}
                </span>
                <div className="pb-0.5">
                  <p className="font-mono text-xs font-medium text-[#888]">
                    {formatCurrency(summary.regretAmount, summary.currency)}
                  </p>
                  <p className="text-[11px] text-[#C0BCB4]">
                    {formatExpenseShare(summary.regretExpenseShare)}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-[18px]">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.8px] text-[#AAA49C]">
                Разметка расходов
              </p>
              <div className="mb-1 flex items-baseline gap-2.5">
                <span className="font-mono text-4xl font-bold leading-none tracking-[-2px] text-[#111]">
                  {summary.markedExpensesCount}
                </span>
              </div>
              <p className="text-[11px] text-[#C0BCB4]">
                Эмоцией отмечено {summary.markedExpensesCount} из{" "}
                <strong className="font-mono font-medium text-[#888]">
                  {summary.totalExpensesCount}
                </strong>{" "}
                расходов
              </p>
              <p className="mt-0.5 text-[11px] text-[#C0BCB4]">
                <strong className="font-mono font-medium text-[#888]">
                  {summary.markedExpensesPercent.toLocaleString("ru-RU", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </strong>
                % расходов размечено эмоцией
              </p>
              <p className="mt-0.5 text-[11px] text-[#C0BCB4]">
                Стрессовые расходы:{" "}
                <strong className="font-mono font-medium text-[#888]">
                  {summary.stressCount}
                </strong>{" "}
                · {formatCurrency(summary.stressAmount, summary.currency)}
              </p>
            </div>
          </div>

          {!hasMarkedExpenses ? (
            <div className="px-6 py-5 text-sm text-[#AAA49C]">
              Пока нет расходов с эмоциональной меткой. Добавьте эмоцию при
              следующей трате, чтобы увидеть поведенческий анализ.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
              <div className="border-b border-[#EDEAE4] px-6 py-5 lg:border-r lg:border-b-0">
                <p className="mb-[18px] text-[11px] font-semibold uppercase tracking-[0.5px] text-[#AAA49C]">
                  Распределение эмоций
                </p>

                {summary.emotionDistribution.length === 0 ? (
                  <p className="text-sm text-[#AAA49C]">
                    Пока нет операций с эмоцией.
                  </p>
                ) : (
                  <div>
                    {summary.emotionDistribution.map((item) => {
                      const meta = getTransactionEmotionMeta(item.emotion);
                      const widthRatio =
                        maxEmotionCount > 0 ? item.count / maxEmotionCount : 0;
                      const widthPercent =
                        item.count > 0 ? Math.max(widthRatio * 90, 8) : 0;

                      return (
                        <div
                          key={item.emotion}
                          className="flex items-center border-b border-[#F4F2EE] py-[9px] last:border-b-0"
                        >
                          <div className="w-[130px] flex-shrink-0">
                            <div className="flex items-center gap-[7px]">
                              <span className="text-sm leading-none">
                                {meta.emoji}
                              </span>
                              <span className="text-xs font-medium text-[#333]">
                                {meta.shortLabel}
                              </span>
                            </div>
                          </div>
                          <div className="mx-[14px] h-1 flex-1 overflow-hidden rounded-sm bg-[#F0EEE9]">
                            <div
                              className="h-full rounded-sm transition-[width] duration-500 ease-out"
                              style={{
                                width: `${widthPercent}%`,
                                backgroundColor:
                                  emotionBarColorMap[item.emotion],
                              }}
                            />
                          </div>
                          <span className="w-6 flex-shrink-0 text-right font-mono text-[13px] font-semibold text-[#333]">
                            {item.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col px-[22px] py-5">
                <p className="mb-[18px] text-[11px] font-semibold uppercase tracking-[0.5px] text-[#AAA49C]">
                  Топ категорий · импульсивно
                </p>

                {summary.topEmotionCategories.length === 0 ? (
                  <p className="text-sm text-[#AAA49C]">
                    Пока недостаточно данных.
                  </p>
                ) : (
                  <div>
                    {summary.topEmotionCategories.map((item) => {
                      const meta = getTransactionEmotionMeta(item.emotion);

                      return (
                        <div
                          key={item.categoryId}
                          className="flex items-start justify-between gap-3 border-b border-[#F4F2EE] py-[11px] last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#111]">
                              {item.categoryName}
                            </p>
                            <p className="text-[10px] text-[#C0BCB4]">
                              {item.count} {formatOperationWord(item.count)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-[13px] font-semibold text-[#111]">
                              {formatCurrency(item.amount, summary.currency)}
                            </p>
                            <span
                              className={`mt-1 inline-flex items-center gap-[3px] rounded-full border px-[7px] py-[2px] text-[9px] font-semibold tracking-[0.3px] ${emotionTagClassMap[item.emotion]}`}
                            >
                              <span>{meta.emoji}</span>
                              <span>{meta.shortLabel}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {summary.fxUnavailable ? (
            <p className="border-t border-[#EDEAE4] px-6 py-3 text-xs text-[#AAA49C]">
              FX недоступен: суммы показаны без полной конвертации.
            </p>
          ) : summary.fxStale ? (
            <p className="border-t border-[#EDEAE4] px-6 py-3 text-xs text-[#AAA49C]">
              Используются последние сохранённые курсы. Данные могут быть не
              актуальны.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
