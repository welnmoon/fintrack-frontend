import type { DashboardForecast } from "@/features/get-dashboard/model/types.api";
import { forecastConfidenceMap } from "@/features/get-dashboard/model/const";
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

type ForecastCardProps = {
  forecast?: DashboardForecast;
  isLoading?: boolean;
  isError?: boolean;
};

const tabTriggerClass =
  "mb-[-1px] h-auto rounded-none border-b-2 border-b-transparent px-4 pb-[10px] pt-0 text-[13px] font-medium text-[#A09E96] transition-colors hover:text-[#1C1B18] data-[state=active]:border-b-[#1C1B18] data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[#1C1B18] data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0";

function StatRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F0EDE5] py-3 last:border-b-0">
      <span className="flex items-center gap-2 text-[13px] text-[#7A7971]">
        <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#D8D4C8]" />
        {label}
      </span>
      <span className={cn("font-mono text-[14px] font-medium text-[#1C1B18]", valueClass)}>
        {value}
      </span>
    </div>
  );
}

export function ForecastCard({ forecast, isLoading, isError }: ForecastCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-8">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !forecast) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-8">
            <div className="rounded-xl border border-dashed p-4 text-sm text-destructive">
              Не удалось загрузить прогноз расходов.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currency = forecast.currency ?? "KZT";
  const confidence = forecastConfidenceMap[forecast.confidence];
  const reliabilityFilled =
    forecast.confidence === "high" ? 3 : forecast.confidence === "medium" ? 2 : 1;

  const totalDays = forecast.daysPassed + forecast.daysRemaining;
  const elapsedPct =
    totalDays > 0 ? Math.min((forecast.daysPassed / totalDays) * 100, 100) : 0;
  const spentPct =
    forecast.spentSoFar + forecast.forecastFutureExpense > 0
      ? Math.min(
          (forecast.spentSoFar /
            (forecast.spentSoFar + forecast.forecastFutureExpense)) *
            100,
          100,
        )
      : 0;

  const exhaustDate =
    forecast.daysToZero !== null && forecast.daysToZero > 0
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + forecast.daysToZero!);
          return d.toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          });
        })()
      : null;

  const maxScenarioExpense = Math.max(
    forecast.scenarios.byMonthAverage.expectedExpense,
    forecast.scenarios.blended.expectedExpense,
    forecast.scenarios.byRecentAverage.expectedExpense,
    1,
  );
  const scenarioWidth = (v: number) =>
    `${Math.max((v / maxScenarioExpense) * 100, 4)}%`;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-[20px] border border-[#E5E2D8] bg-white">
          <Tabs defaultValue="brief" className="gap-0">
            {/* Header + tab list */}
            <div className="px-8 pt-6 pb-0">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C1B18]">
                  Прогноз до конца месяца
                </span>
                <span className="text-[12px] text-[#A09E96]">
                  Оценка остатка на основе текущего месяца и последних 7 дней
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
              {/* Main grid */}
              <div className="grid grid-cols-1 gap-0 px-8 pt-8 pb-0 md:grid-cols-[3fr_1px_2fr]">
                {/* Left */}
                <div className="pb-6 md:pr-8">
                  <p className="mb-[10px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B0ADA4]">
                    Прогноз остатка
                  </p>
                  <p className="font-mono text-[38px] font-light leading-none tracking-[-0.03em] text-[#1C1B18]">
                    {formatCurrency(forecast.projectedEndBalance, currency)}
                  </p>
                  <div className="mt-[10px] inline-flex items-center gap-1.5 rounded-lg bg-[#FEF0E8] px-2.5 py-[5px] font-mono text-[13px] font-medium text-[#C05621]">
                    <span className="text-[10px]">↓</span>
                    <span>
                      −{formatCurrency(forecast.forecastFutureExpense, currency)}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#B0ADA4]">
                    Ожидаемые расходы за оставшиеся {forecast.daysRemaining}{" "}
                    дн.
                  </p>
                </div>

                {/* Vertical divider */}
                <div className="hidden bg-[#E5E2D8] md:block my-2" />

                {/* Right */}
                <div className="border-t border-[#E5E2D8] pb-6 pt-6 md:border-t-0 md:pl-8 md:pt-0">
                  <div className="mb-6">
                    <p className="mb-[10px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B0ADA4]">
                      До конца месяца
                    </p>
                    <p className="font-mono text-[38px] font-light leading-none tracking-[-0.03em] text-[#1C1B18]">
                      {forecast.daysRemaining}
                      <span className="ml-1 text-[22px] text-[#A09E96]"> дн.</span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-[10px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B0ADA4]">
                      Средств хватит
                    </p>
                    {forecast.daysToZero !== null ? (
                      <>
                        <p className="font-mono text-[38px] font-light leading-none tracking-[-0.03em] text-[#1C1B18]">
                          {forecast.daysToZero}
                          <span className="ml-1 text-[22px] text-[#A09E96]"> дн.</span>
                        </p>
                        {exhaustDate && (
                          <p className="mt-1.5 text-[12px] text-[#B0ADA4]">
                            При текущем темпе расходов —{" "}
                            <span className="font-medium text-[#6DAF77]">
                              до {exhaustDate}
                            </span>
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="font-mono text-[38px] font-light leading-none tracking-[-0.03em] text-[#A09E96]">
                        —
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Month progress bar */}
              <div className="mx-8 border-t border-[#E5E2D8] px-0 py-6">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[12px] text-[#A09E96]">
                    Прогресс месяца
                  </span>
                  <span className="font-mono text-[12px] text-[#A09E96]">
                    {forecast.daysPassed} из {totalDays} дн.
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-[#F0EDE5]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#D8D4C8]"
                    style={{ width: `${elapsedPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#C8A87A]"
                    style={{ width: `${spentPct}%`, opacity: 0.85 }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#B0ADA4]">
                    <span className="h-2 w-2 rounded-[2px] bg-[#D8D4C8]" />
                    Дней прошло ({Math.round(elapsedPct)}%)
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#B0ADA4]">
                    <span className="h-2 w-2 rounded-[2px] bg-[#C8A87A]" style={{ opacity: 0.85 }} />
                    Уже потрачено —{" "}
                    {formatCurrency(forecast.spentSoFar, currency)} ({Math.round(spentPct)}%)
                  </span>
                </div>
              </div>

              {/* Reliability row */}
              <div className="flex items-start gap-4 border-t border-[#E5E2D8] px-8 py-5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FEF3E2]">
                  <div className="flex items-center gap-[3px]">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 w-5 rounded-[2px]",
                          i <= reliabilityFilled ? "bg-[#C8A87A]" : "bg-[#E5E2D8]",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium text-[#1C1B18]">
                      Достоверность прогноза
                    </span>
                    <span className="rounded-[5px] bg-[#FEF0C8] px-2 py-[2px] text-[11px] font-medium text-[#8A6020]">
                      {confidence.label}
                    </span>
                  </div>
                  <p className="text-[12px] leading-[1.5] text-[#A09E96]">
                    {confidence.description} Учтено{" "}
                    {forecast.basedOnTransactionsCount} операций.{" "}
                    {forecast.calculationNote}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ===== ПОДРОБНО ===== */}
            <TabsContent value="detailed" className="mt-0">
              {/* Section header */}
              <div className="border-t border-[#E5E2D8] px-8 pt-6 pb-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#B0ADA4]">
                  Дневной темп расходов
                </p>
                <p className="mb-4 text-[12px] text-[#C0BDB4]">
                  Скользящая модель · месяц и последние 7 дней
                </p>
              </div>

              {/* Rate columns */}
              <div className="grid grid-cols-1 gap-0 px-8 pb-6 sm:grid-cols-[1fr_1px_1fr_1px_1fr]">
                <div className="pb-4 sm:pb-0 sm:pr-6">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#B0ADA4]">
                    По месяцу
                  </p>
                  <p className="font-mono text-[22px] font-normal leading-none tracking-[-0.02em] text-[#1C1B18]">
                    {formatCurrency(forecast.monthAvg, currency)}
                    <span className="text-[13px] text-[#A09E96]">/д</span>
                  </p>
                </div>
                <div className="hidden bg-[#E5E2D8] sm:block my-1" />
                <div className="border-t border-[#E5E2D8] py-4 sm:border-t-0 sm:px-6 sm:py-0">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#B0ADA4]">
                    За 7 дней
                  </p>
                  <p className="font-mono text-[22px] font-normal leading-none tracking-[-0.02em] text-[#1C1B18]">
                    {formatCurrency(forecast.recent7Avg, currency)}
                    <span className="text-[13px] text-[#A09E96]">/д</span>
                  </p>
                </div>
                <div className="hidden bg-[#E5E2D8] sm:block my-1" />
                <div className="border-t border-[#E5E2D8] pt-4 sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#B0ADA4]">
                    Итоговый (blended)
                  </p>
                  <p className="font-mono text-[22px] font-semibold leading-none tracking-[-0.02em] text-[#1C1B18]">
                    {formatCurrency(forecast.blendedDailyExpense, currency)}
                    <span className="text-[13px] font-normal text-[#A09E96]">/д</span>
                  </p>
                </div>
              </div>

              {/* Stats table */}
              <div className="border-t border-[#E5E2D8] px-8 py-1">
                <StatRow
                  label="Операций учтено"
                  value={String(forecast.basedOnTransactionsCount)}
                />
                <StatRow
                  label="Уже потрачено в этом месяце"
                  value={formatCurrency(forecast.spentSoFar, currency)}
                />
                <StatRow
                  label="За последние 7 дней"
                  value={formatCurrency(forecast.recent7Spent, currency)}
                />
                <StatRow
                  label="Средств хватит примерно на"
                  value={
                    forecast.daysToZero !== null
                      ? `${forecast.daysToZero} дн.`
                      : "—"
                  }
                  valueClass="text-[#3F8F4A]"
                />
              </div>

              {/* Scenarios */}
              <div className="border-t border-[#E5E2D8] px-8 pt-6 pb-0">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#B0ADA4]">
                  Сценарии прогноза
                </p>
                {(
                  [
                    {
                      label: "По среднему за месяц",
                      scenario: forecast.scenarios.byMonthAverage,
                      isHighlight: false,
                    },
                    {
                      label: "Смешанная оценка",
                      scenario: forecast.scenarios.blended,
                      isHighlight: true,
                    },
                    {
                      label: "По последним 7 дням",
                      scenario: forecast.scenarios.byRecentAverage,
                      isHighlight: false,
                    },
                  ] as const
                ).map(({ label, scenario, isHighlight }) => (
                  <div
                    key={label}
                    className={cn(
                      "grid grid-cols-[160px_1fr_auto] items-center gap-4 border-b border-[#F0EDE5] py-[11px] last:border-b-0",
                      isHighlight &&
                        "-mx-3 rounded-lg border-b-transparent bg-[#FAFAF7] px-3",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[13px] text-[#7A7971]",
                        isHighlight && "font-medium text-[#1C1B18]",
                      )}
                    >
                      {label}
                    </span>
                    <div className="h-1 overflow-hidden rounded-full bg-[#F0EDE5]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          isHighlight ? "bg-[#C8A87A]" : "bg-[#D8D4C8]",
                        )}
                        style={{
                          width: scenarioWidth(scenario.expectedExpense),
                        }}
                      />
                    </div>
                    <div className="text-right">
                      <span className="mb-0.5 block font-mono text-[11px] text-[#C05621]">
                        −{formatCurrency(scenario.expectedExpense, currency)}
                      </span>
                      <span className="font-mono text-[14px] font-medium text-[#1C1B18]">
                        {formatCurrency(scenario.projectedEndBalance, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-[#E5E2D8] px-8 py-4 text-[12px] leading-[1.6] text-[#C0BDB4]">
                Смешанная оценка используется как основной прогноз.{" "}
                {forecast.calculationNote}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
