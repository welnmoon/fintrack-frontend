import { Download, FileJson, FileText, Lock } from "lucide-react";
import { useState } from "react";
import type { GetDashboardResponse } from "@/features/get-dashboard/model/types.api";
import { downloadCsv } from "@/shared/lib/export/download-csv";
import { downloadJson } from "@/shared/lib/export/download-json";
import { generatePdf } from "@/shared/lib/export/generate-pdf";
import { USER_PLAN } from "@/shared/model/plan";
import { Button, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib";

type ExportReportsCardProps = {
  data?: GetDashboardResponse;
  currency?: string;
  isLoading?: boolean;
};

function PremiumBadge() {
  return (
    <span className="ml-auto flex-shrink-0 rounded-full border border-[#F3D9A0] bg-[#FEF5E6] px-[9px] py-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.5px] text-[#C07C1A]">
      Premium
    </span>
  );
}

function buildPeriodLabel(data: GetDashboardResponse): string {
  const { periodStart, periodEnd } = data.expenseAndIncomes;
  if (!periodStart || !periodEnd) return "Текущий месяц";
  return `${new Date(periodStart).toLocaleDateString("ru-RU")} – ${new Date(periodEnd).toLocaleDateString("ru-RU")}`;
}

export function ExportReportsCard({
  data,
  currency = "KZT",
  isLoading = false,
}: ExportReportsCardProps) {
  const isPremium = USER_PLAN === "PREMIUM";
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleCsvExport = () => {
    if (!data?.lastTransactions?.length) return;
    const rows = data.lastTransactions.map((tx) => ({
      date: new Date(tx.occurredAt).toLocaleDateString("ru-RU"),
      type:
        tx.type === "EXPENSE"
          ? "Расход"
          : tx.type === "INCOME"
            ? "Доход"
            : "Корректировка",
      category: tx.category?.name ?? "",
      account: tx.account.name,
      amount: tx.amount,
      currency: tx.account.currency,
      emotion: tx.type === "EXPENSE" ? (tx.emotion ?? "") : "",
      note: "",
    }));
    downloadCsv(rows, "fintrack-recent-transactions.csv");
  };

  const handleJsonExport = () => {
    if (!data) return;
    const net = data.expenseAndIncomes.income - data.expenseAndIncomes.expense;
    const report = {
      generatedAt: new Date().toISOString(),
      period: buildPeriodLabel(data),
      summary: {
        balance: data.accountsTotalBalance.total,
        income: data.expenseAndIncomes.income,
        expenses: data.expenseAndIncomes.expense,
        net,
        currency,
      },
      forecast: {
        projectedEndBalance: data.forecast.projectedEndBalance,
        forecastFutureExpense: data.forecast.forecastFutureExpense,
        daysToZero: data.forecast.daysToZero,
        daysRemaining: data.forecast.daysRemaining,
        confidence: data.forecast.confidence,
        calculationNote: data.forecast.calculationNote,
        scenarios: data.forecast.scenarios,
      },
      emotionalSummary: {
        period: data.emotionsSummary.periodLabel,
        totalExpensesCount: data.emotionsSummary.totalExpensesCount,
        markedExpensesCount: data.emotionsSummary.markedExpensesCount,
        markedExpensesPercent: data.emotionsSummary.markedExpensesPercent,
        impulsiveCount: data.emotionsSummary.impulsiveCount,
        impulsiveAmount: data.emotionsSummary.impulsiveAmount,
        regretCount: data.emotionsSummary.regretCount,
        regretAmount: data.emotionsSummary.regretAmount,
        stressCount: data.emotionsSummary.stressCount,
        stressAmount: data.emotionsSummary.stressAmount,
      },
      insights: data.insights,
      expenseStructure: data.expensePie.items.map((item) => ({
        category: item.name,
        amount: item.amount,
        currency,
      })),
      recentTransactions: data.lastTransactions.map((tx) => ({
        date: tx.occurredAt,
        type: tx.type,
        category: tx.category?.name ?? null,
        account: tx.account.name,
        amount: tx.amount,
        currency: tx.account.currency,
        emotion: tx.type === "EXPENSE" ? tx.emotion : null,
      })),
    };
    downloadJson(report, "fintrack-financial-report.json");
  };

  const handlePdfExport = () => {
    if (!data) return;
    const net = data.expenseAndIncomes.income - data.expenseAndIncomes.expense;
    generatePdf({
      generatedAt: new Date().toLocaleString("ru-RU"),
      period: buildPeriodLabel(data),
      balance: data.accountsTotalBalance.total ?? 0,
      income: data.expenseAndIncomes.income,
      expense: data.expenseAndIncomes.expense,
      net,
      currency,
      forecast: {
        projectedEndBalance: data.forecast.projectedEndBalance,
        forecastFutureExpense: data.forecast.forecastFutureExpense,
        daysToZero: data.forecast.daysToZero,
        daysRemaining: data.forecast.daysRemaining,
      },
      insights: data.insights,
      emotionSummary: {
        impulsiveCount: data.emotionsSummary.impulsiveCount,
        impulsiveAmount: data.emotionsSummary.impulsiveAmount,
        stressCount: data.emotionsSummary.stressCount,
        regretCount: data.emotionsSummary.regretCount,
        totalExpensesCount: data.emotionsSummary.totalExpensesCount,
        markedExpensesCount: data.emotionsSummary.markedExpensesCount,
      },
      topCategories: data.expensePie.items.slice(0, 5).map((i) => ({
        name: i.name,
        amount: i.amount,
      })),
    });
  };

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#DDD9D1] bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-3 border-b border-[#EDEAE4] px-6 py-4">
        <span className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
          Экспорт отчётов
        </span>
        <span className="text-xs text-[#B5B0A8]">
          Сохраните операции и аналитику для архива, Excel или внешнего анализа
        </span>
        {!isPremium && (
          <span className="ml-auto rounded-full border border-[#E6E3DC] bg-[#F7F6F3] px-[9px] py-[2px] text-[10px] font-semibold text-[#888]">
            Free
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 divide-y divide-[#F4F2EE] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {/* Left — Free tier */}
        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-[#AAA49C]">
              Базовый экспорт
            </p>
            <p className="text-[12px] text-[#888]">
              Доступно всем пользователям
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-xl" />
          ) : (
            <button
              type="button"
              onClick={handleCsvExport}
              disabled={!data?.lastTransactions?.length}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-[#DDD9D1] bg-[#FAFAF8] px-4 py-3 text-left transition-colors hover:bg-white hover:border-[#C0BCB4] disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EDFAF4]">
                <Download className="h-4 w-4 text-[#1A9E6A]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#111]">
                  CSV последних операций
                </p>
                <p className="text-[11px] text-[#AAA49C]">
                  fintrack-recent-transactions.csv
                </p>
              </div>
              <span className="flex-shrink-0 rounded-full border border-[#C2EDD8] bg-[#EDFAF4] px-[9px] py-[2px] text-[9px] font-semibold uppercase tracking-[0.5px] text-[#1A9E6A]">
                Free
              </span>
            </button>
          )}
        </div>

        {/* Right — Premium tier */}
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-[#AAA49C]">
                Premium Analytics
              </p>
              <p className="text-[12px] text-[#888]">
                {isPremium
                  ? "Все форматы экспорта доступны"
                  : "Расширенный экспорт с аналитикой"}
              </p>
            </div>
            {!isPremium && (
              <Lock className="h-4 w-4 flex-shrink-0 text-[#C0BCB4]" />
            )}
          </div>

          <div className="space-y-2">
            {/* JSON Export */}
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <button
                type="button"
                onClick={isPremium ? handleJsonExport : undefined}
                disabled={!isPremium || !data}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  isPremium
                    ? "border-[#DDD9D1] bg-[#FAFAF8] hover:bg-white hover:border-[#C0BCB4]"
                    : "border-dashed border-[#E6E3DC] bg-[#FAFAF8] cursor-not-allowed opacity-60",
                )}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#F0F4FF]">
                  <FileJson className="h-4 w-4 text-[#2A4490]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#111]">
                    JSON-отчёт
                  </p>
                  <p className="text-[11px] text-[#AAA49C]">
                    fintrack-financial-report.json
                  </p>
                </div>
                <PremiumBadge />
              </button>
            )}

            {/* PDF Export */}
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <button
                type="button"
                onClick={isPremium ? handlePdfExport : undefined}
                disabled={!isPremium || !data}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  isPremium
                    ? "border-[#DDD9D1] bg-[#FAFAF8] hover:bg-white hover:border-[#C0BCB4]"
                    : "border-dashed border-[#E6E3DC] bg-[#FAFAF8] cursor-not-allowed opacity-60",
                )}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#FEF5E6]">
                  <FileText className="h-4 w-4 text-[#C07C1A]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#111]">
                    PDF-отчёт
                  </p>
                  <p className="text-[11px] text-[#AAA49C]">
                    Открывает окно печати браузера
                  </p>
                </div>
                <PremiumBadge />
              </button>
            )}

            {/* Period export */}
            <div
              className={cn(
                "rounded-xl border p-4",
                isPremium
                  ? "border-[#DDD9D1] bg-[#FAFAF8]"
                  : "border-dashed border-[#E6E3DC] bg-[#FAFAF8] opacity-60",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#333]">
                  Экспорт за произвольный период
                </p>
                <PremiumBadge />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled={!isPremium}
                  placeholder="От"
                  className="w-full rounded-lg border border-[#DDD9D1] bg-white px-3 py-1.5 text-[12px] text-[#333] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-[#DDD9D1]"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled={!isPremium}
                  placeholder="До"
                  className="w-full rounded-lg border border-[#DDD9D1] bg-white px-3 py-1.5 text-[12px] text-[#333] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-[#DDD9D1]"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!isPremium || !fromDate || !toDate}
                  className="flex-shrink-0"
                  variant="outline"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
              {!isPremium && (
                <p className="mt-2 text-[11px] text-[#AAA49C]">
                  Доступно в Premium Analytics
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isPremium && (
        <div className="border-t border-[#EDEAE4] px-6 py-3">
          <p className="text-[11px] text-[#AAA49C]">
            <span className="font-semibold text-[#C07C1A]">Premium Analytics</span>{" "}
            открывает JSON-отчёт для внешнего анализа, PDF-отчёт и экспорт за
            произвольный период.
          </p>
        </div>
      )}
    </div>
  );
}
