import type { CurrencyCode } from "@/shared/model/currency/schema";

export type TransactionType = "INCOME" | "EXPENSE" | "ADJUSTMENT";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
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
