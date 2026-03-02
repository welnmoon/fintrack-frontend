import type { CategoryType } from "@/entities/category";
import type { TransactionType } from "@/entities/transaction";
import type { CurrencyCode } from "@/shared/model/currency/schema";

export type AccountsTotalBalance =
  | {
      currency: CurrencyCode;
      total: number;
      fxUnavailable: boolean;
      totalsByCurrency: Record<CurrencyCode, number>;
    }
  | {
      currency: CurrencyCode;
      total: null;
      fxUnavailable: boolean;
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

export type GetDashboardResponse = {
  accountsTotalBalance: AccountsTotalBalance;
  expenseAndIncomes: DashboardExpenseAndIncomes;
  lastTransactions: DashboardLastTransaction[];
  expensePie: DashboardExpensePieItem[];
};
