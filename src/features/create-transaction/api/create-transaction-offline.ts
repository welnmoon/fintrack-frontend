import { fintrackDb, type LocalTransaction } from "@/shared/lib/db/fintrack-db";
import type { CreateTransactionType } from "../model/schema";

export async function createTransactionOffline(input: CreateTransactionType) {
  const now = new Date().toISOString();

  const transaction: LocalTransaction = {
    id: crypto.randomUUID(),
    serverId: undefined,

    accountId: input.accountId,
    categoryId: input.categoryId,

    type: input.type,
    emotion: input.emotion,

    amount: input.amount,
    originalAmount: input.originalAmount,
    originalCurrency: input.originalCurrency,
    exchangeRate: input.exchangeRate,

    occurredAt: input.occurredAt,
    note: input.note,

    createdAt: now,
    updatedAt: now,

    syncStatus: "pending",
  };

  await fintrackDb.transaction(
    "rw",
    fintrackDb.transactions,
    fintrackDb.syncQueue,
    async () => {
      await fintrackDb.transactions.add(transaction);

      await fintrackDb.syncQueue.add({
        entity: "transaction",
        operation: "create",
        localId: transaction.id,
        payload: transaction,
        createdAt: now,
        status: "pending",
      });
    },
  );

  return transaction;
}
