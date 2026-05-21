import type { CategoryType } from "@/entities/category";
import type { TransactionEmotion, TransactionType } from "@/entities/transaction";
import type { CurrencyCode } from "@/shared/model/currency/schema";

export type AccountsTotalBalance =
  | {
      currency: CurrencyCode;
      total: number;
      fxUnavailable: boolean;
      fxStale: boolean;
      totalsByCurrency: Record<CurrencyCode, number>;
    }
  | {
      currency: CurrencyCode;
      total: null;
      fxUnavailable: boolean;
      fxStale: boolean;
      totalsByCurrency: Record<CurrencyCode, number>;
    };

export type DashboardTopCategory = {
  amount: number;
  id: string;
  type: CategoryType;
  name: string;
  colorKey: string | null;
  iconKey: string | null;
};

export type DashboardExpenseAndIncomes = {
  topExpenseCategory: DashboardTopCategory | null;
  topIncomeCategory: DashboardTopCategory | null;
  periodStart: Date;
  periodEnd: Date;
  income: number;
  expense: number;
};

export type DashboardTransactionAccount = {
  id: string;
  name: string;
  currency: CurrencyCode;
};

export type DashboardTransactionCategory = {
  id: string;
  name: string;
} | null;

export type DashboardLastTransaction = {
  id: string;
  account: DashboardTransactionAccount;
  type: TransactionType;
  emotion: TransactionEmotion | null;
  amount: number;
  originalAmount: number | null;
  occurredAt: Date;
  category: DashboardTransactionCategory;
};

export type DashboardExpensePieItem = {
  id: string;
  name: string;
  iconKey: string | null;
  colorKey: string | null;
  amount: number;
};

export type DashboardExpensePie = {
  items: DashboardExpensePieItem[];
  currency: CurrencyCode;
  fxUnavailable: boolean;
  fxStale: boolean;
};

export type DashboardForecastConfidence = "low" | "medium" | "high";

export type DashboardForecastScenario = {
  expectedExpense: number;
  projectedEndBalance: number;
};

export type DashboardForecast = {
  currency: CurrencyCode | null;
  currentBalance: number;
  spentSoFar: number;
  recent7Spent: number;
  monthAvg: number;
  recent7Avg: number;
  blendedDailyExpense: number;
  forecastFutureExpense: number;
  projectedEndBalance: number;
  daysPassed: number;
  daysRemaining: number;
  basedOnTransactionsCount: number;
  confidence: DashboardForecastConfidence;
  calculationNote: string;
  daysToZero: number | null;
  scenarios: {
    byMonthAverage: DashboardForecastScenario;
    blended: DashboardForecastScenario;
    byRecentAverage: DashboardForecastScenario;
  };
};

export type DashboardEmotionDistributionItem = {
  emotion: TransactionEmotion;
  count: number;
};

export type DashboardEmotionCategory = {
  emotion: TransactionEmotion;
  categoryId: string;
  categoryName: string;
  count: number;
  amount: number;
};

export type DashboardEmotionsSummary = {
  currency: CurrencyCode;
  fxUnavailable: boolean;
  fxStale: boolean;
  periodLabel: string;
  totalExpensesCount: number;
  markedExpensesCount: number;
  markedExpensesPercent: number;
  totalTransactionsWithEmotion: number;
  impulsiveCount: number;
  regretCount: number;
  stressCount: number;
  impulsiveAmount: number;
  regretAmount: number;
  stressAmount: number;
  emotionDistribution: DashboardEmotionDistributionItem[];
  impulsiveExpenseShare: number;
  regretExpenseShare: number;
  stressShareByAmount: number;
  impulsiveShareByCount: number;
  regretShareByCount: number;
  topEmotionCategories: DashboardEmotionCategory[];
};

export type FinancialInsight = {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
};

export type GetDashboardResponse = {
  accountsTotalBalance: AccountsTotalBalance;
  expenseAndIncomes: DashboardExpenseAndIncomes;
  lastTransactions: DashboardLastTransaction[];
  expensePie: DashboardExpensePie;
  forecast: DashboardForecast;
  emotionsSummary: DashboardEmotionsSummary;
  insights: FinancialInsight[];
};

export type BalanceHistoryInterval = "day" | "week" | "month";

export type DashboardBalanceHistoryPoint = {
  periodStart: string;
  periodEnd: string;
  total: number | null;
  totalsByCurrency: Partial<Record<CurrencyCode, number>>;
};

export type GetBalanceHistoryResponse = {
  interval: BalanceHistoryInterval;
  currency: CurrencyCode;
  fxUnavailable: boolean;
  fxStale: boolean;
  points: DashboardBalanceHistoryPoint[];
};
