import type { TransactionType } from "@/entities/transaction";

export type SetBalancePayload = {
  accountId: string;
  type: "ADJUSTMENT";
  amount: number;
  note?: string;
  occurredAt: string;
};

export type SetBalanceRequest = {
  id: string;
  userId: string;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  occurredAt: Date;
  note: string | null;
  accountId: string;
  categoryId: string | null;
};
