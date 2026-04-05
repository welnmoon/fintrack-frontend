import type { CurrencyCode } from "@/shared/model/currency/schema";

export type TransactionType = "INCOME" | "EXPENSE" | "ADJUSTMENT";
export const TRANSACTION_EMOTIONS = [
  "NEUTRAL",
  "HAPPY",
  "IMPULSIVE",
  "STRESS",
  "REGRET",
] as const;
export type TransactionEmotion = (typeof TRANSACTION_EMOTIONS)[number];

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  emotion: TransactionEmotion | null;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  occurredAt: Date;
  note: string | null;
  category: {
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  accountId: string;
  categoryId: string | null;
  account: {
    currency: CurrencyCode;
  };
}
