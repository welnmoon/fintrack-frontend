export type SetBalancePayload = {
  amount: number;
  note?: string;
};

export type SetBalanceRequest = {
  id: string;
  userId: string;
  type: "ADJUSTMENT";
  createdAt: string;
  updatedAt: string;
  amount: number;
  occurredAt: string;
  note: string | null;
  accountId: string;
  categoryId: string | null;
};
