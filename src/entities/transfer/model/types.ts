export type TransferType = {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  occurredAt: Date;
  note: string | null;
  createdAt: Date;
  isCanceled: boolean;
};
