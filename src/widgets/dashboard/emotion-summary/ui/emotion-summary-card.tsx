import {
  Brain,
  Gauge,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  EmotionBadge,
  getTransactionEmotionMeta,
} from "@/entities/transaction";
import type { DashboardEmotionsSummary } from "@/features/get-dashboard/model/types.api";
import { cn, formatCurrency } from "@/shared/lib";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/ui";

type EmotionSummaryCardProps = {
  summary?: DashboardEmotionsSummary;
  isLoading?: boolean;
  isError?: boolean;
};

export function EmotionSummaryCard({
  summary,
  isLoading = false,
  isError = false,
}: EmotionSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Эмоциональный фон расходов</CardTitle>
          <CardDescription>
            Аналитика по эмоциональной оценке операций.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-28 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Эмоциональный фон расходов</CardTitle>
          <CardDescription>
            Аналитика по эмоциональной оценке операций.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed p-4 text-sm text-destructive">
            Не удалось загрузить эмоциональную аналитику.
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = summary.totalTransactionsWithEmotion;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Эмоциональный фон расходов</CardTitle>
        <CardDescription>
          Быстрый срез по импульсивным, стрессовым и нежелательным покупкам.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border bg-card/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Импульсивные траты
              </span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {summary.impulsiveCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(summary.impulsiveAmount, summary.currency)} •{" "}
              {summary.impulsiveExpenseShare}% от всех расходов
            </p>
          </div>

          <div className="rounded-2xl border bg-card/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Сожаление после покупки
              </span>
              <TriangleAlert className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {summary.regretCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(summary.regretAmount, summary.currency)} •{" "}
              {summary.regretExpenseShare}% от всех расходов
            </p>
          </div>

          <div className="rounded-2xl border bg-card/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Операции с эмоцией
              </span>
              <Brain className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {summary.totalTransactionsWithEmotion}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Стрессовых операций: {summary.stressCount}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Распределение эмоций</p>
                <p className="text-xs text-muted-foreground">
                  По операциям, где пользователь явно выбрал состояние.
                </p>
              </div>
              <Gauge className="h-4 w-4 text-accent" />
            </div>

            {summary.emotionDistribution.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Пока нет операций с эмоцией.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {summary.emotionDistribution.map((item) => {
                  const meta = getTransactionEmotionMeta(item.emotion);
                  const width = total > 0 ? (item.count / total) * 100 : 0;

                  return (
                    <div key={item.emotion} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <EmotionBadge emotion={item.emotion} />
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            meta.badgeClassName,
                          )}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-muted/20 p-4">
            <p className="text-sm font-medium">Топ категорий импульсивных трат</p>
            <p className="text-xs text-muted-foreground">
              Категории, где импульсивные покупки встречаются чаще всего.
            </p>

            {summary.topEmotionCategories.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Пока недостаточно данных.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {summary.topEmotionCategories.map((item) => (
                  <div
                    key={item.categoryId}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-background/70 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.categoryName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} операций
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.amount, summary.currency)}
                      </p>
                      <EmotionBadge emotion={item.emotion} className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {summary.fxUnavailable ? (
          <p className="text-xs text-muted-foreground">
            FX недоступен: суммы показаны без полной конвертации.
          </p>
        ) : summary.fxStale ? (
          <p className="text-xs text-muted-foreground">
            Используются последние сохранённые курсы. Данные могут быть не
            актуальны.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
