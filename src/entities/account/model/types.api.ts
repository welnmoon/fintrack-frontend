import type { CurrencyCode } from "@/shared/model/currency/schema";

export type AccountType = "CASH" | "BANK";

export interface GetAccount {
  id: string;
  name: string;
  currency: CurrencyCode;
  type: AccountType;
  accountNumber: string | null;
  initialBalance: number;
  balance: number;
}

export interface GetAccountOptions {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
}
