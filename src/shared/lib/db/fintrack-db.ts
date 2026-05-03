import Dexie, { type Table } from "dexie";

export type SyncStatus = "synced" | "pending" | "failed" | "conflict";

export type Currency = "USD" | "KZT" | "EUR";

export type AccountType = "CASH" | "BANK";

export type CategoryType = "INCOME" | "EXPENSE";

export type TransactionType = "INCOME" | "EXPENSE" | "ADJUSTMENT";

export type Emotion = "NEUTRAL" | "HAPPY" | "IMPULSIVE" | "STRESS" | "REGRET";

export type LocalAccount = {
  id: string;
  serverId?: string;

  name: string;
  type: AccountType;
  currency: Currency;
  backgroundKey: string;
  initialBalance: number;

  createdAt: string;
  updatedAt: string;

  syncStatus: SyncStatus;
};

export type LocalCategory = {
  id: string;
  serverId?: string;

  name: string;
  type: CategoryType;
  colorKey?: string;
  iconKey?: string;

  createdAt: string;
  updatedAt: string;

  syncStatus: SyncStatus;
};

export type LocalTransaction = {
  id: string;
  serverId?: string;

  accountId: string;
  categoryId?: string;

  type: TransactionType;
  emotion?: Emotion;

  amount: number;
  originalAmount?: number;
  originalCurrency?: Currency;
  exchangeRate?: number;

  occurredAt: string;
  note?: string;

  createdAt: string;
  updatedAt: string;

  syncStatus: SyncStatus;
};

export type LocalTransfer = {
  id: string;
  serverId?: string;

  fromAccountId: string;
  toAccountId: string;

  fromAmount: number;
  toAmount: number;
  exchangeRate: number;

  occurredAt: string;
  note?: string;

  createdAt: string;
  isCanceled: boolean;

  syncStatus: SyncStatus;
};

export type LocalForexCandle = {
  symbol: string;
  interval: string;
  time: string;

  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;

  createdAt: string;
  updatedAt: string;
};

export type LocalSyncQueueItem = {
  id?: number;

  entity: "account" | "category" | "transaction" | "transfer";
  operation: "create" | "update" | "delete";

  localId: string;
  serverId?: string;

  payload: unknown;

  createdAt: string;
  status: "pending" | "failed";
  errorMessage?: string;
};

class FintrackDB extends Dexie {
  accounts!: Table<LocalAccount, string>;
  categories!: Table<LocalCategory, string>;
  transactions!: Table<LocalTransaction, string>;
  transfers!: Table<LocalTransfer, string>;
  forexCandles!: Table<LocalForexCandle, string>;
  syncQueue!: Table<LocalSyncQueueItem, number>;

  constructor() {
    super("fintrack-db");

    this.version(1).stores({
      accounts: "id, serverId, type, currency, syncStatus, updatedAt",
      categories: "id, serverId, type, syncStatus, updatedAt",
      transactions:
        "id, serverId, accountId, categoryId, type, emotion, syncStatus, occurredAt, updatedAt",
      transfers:
        "id, serverId, fromAccountId, toAccountId, syncStatus, occurredAt, isCanceled",
      forexCandles: "[symbol+interval+time], symbol, interval, time",
      syncQueue:
        "++id, entity, operation, localId, serverId, createdAt, status",
    });
  }
}

export const fintrackDb = new FintrackDB();
