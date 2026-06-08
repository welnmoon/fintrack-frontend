import type { CurrencyCode } from "@/shared/model/currency/schema";
import type { AccountBackgroundKey } from "../lib/account-backgrounds";

export type AccountType = "CASH" | "BANK";

export interface GetAccount {
  id: string;
  name: string;
  currency: CurrencyCode;
  type: AccountType;
  backgroundKey: AccountBackgroundKey;
  accountNumber: string | null;
  initialBalance: number;
  balance: number;
  convertedBalance?: number;
  convertedCurrency?: CurrencyCode;
  isArchived?: boolean;
  archivedAt?: string | null;
}

export interface GetAccountOptions {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  backgroundKey: AccountBackgroundKey;
}
