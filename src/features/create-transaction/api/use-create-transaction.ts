import { transactionsApi } from "@/entities/transaction/api/transactions.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTransactionType } from "../model/schema";
import { dashboardQueryKey } from "@/features/get-dashboard/api/use-get-dashboard";
import type { Transaction } from "@/entities/transaction";
import type { CurrencyCode } from "@/shared/model/currency/schema";

export type OptimisticTransaction = Omit<
  Transaction,
  "createdAt" | "updatedAt" | "category" | "account"
> & {
  createdAt?: Date;
  updatedAt?: Date;
  category?: Transaction["category"];
  account?: Transaction["account"];
  __optimistic?: true;
};

export const useCreateTransaction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateTransactionType) =>
      httpClient(transactionsApi.create(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dto),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      await qc.invalidateQueries({ queryKey: ["accounts"] });
      await qc.invalidateQueries({ queryKey: [dashboardQueryKey] });
    },
    onMutate: async (dto) => {
      qc.cancelQueries({ queryKey: ["transactions"] });

      const now = new Date();

      type Account = { id: string; currency: CurrencyCode };

      const prevTransactions = qc.getQueryData<Transaction[]>(["transactions"]);
      const accounts = qc.getQueryData<Account[]>(["accounts"]);
      const currency =
        accounts?.find((a) => a.id === dto.accountId)?.currency ?? "USD";

      const optimisticTx: Transaction = {
        id: `optimistic-${crypto.randomUUID()}`,
        userId: "me",
        type: dto.type,
        createdAt: now,
        updatedAt: now,
        amount: dto.amount,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : now,
        note: dto.note ?? null,
        categoryId: dto.categoryId ?? null,
        accountId: dto.accountId,
        category: null,
        account: { currency },
      };

      qc.setQueryData<Transaction[]>(["transactions"], (old) => {
        const list = old ?? [];
        return [optimisticTx, ...list];
      });

      return { prevTransactions };
    },
    onError: (_err, _dto, ctx) => {
      if (!ctx) return;
      qc.setQueryData(["transactions"], ctx.prevTransactions);
    },

    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
