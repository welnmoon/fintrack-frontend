import { transactionsApi } from "@/entities/transaction/api/transactions.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTransactionType } from "../model/schema";
import type { Transaction } from "@/entities/transaction";
import { userCategoriesQueryKey } from "@/entities/category/api/use-get-categories";
import type { UserCategory } from "@/entities/category/model/types.api";
import type { GetAccount } from "@/entities/account/model/types.api";
import { invalidateFinancialData } from "@/shared/lib/query/invalidate-financial-data";

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
      await invalidateFinancialData(qc);
    },
    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: ["transactions"] });
      await qc.cancelQueries({ queryKey: ["accounts"] });

      const now = new Date();

      const prevTransactions = qc.getQueryData<Transaction[]>(["transactions"]);
      const prevAccounts = qc.getQueryData<GetAccount[]>(["accounts"]);
      const categories = qc.getQueryData<UserCategory[]>([
        userCategoriesQueryKey,
      ]);
      const currency =
        prevAccounts?.find((a) => a.id === dto.accountId)?.currency ?? "USD";
      const category =
        categories?.find((item) => item.id === dto.categoryId) ?? null;

      const optimisticTx: Transaction = {
        id: `optimistic-${crypto.randomUUID()}`,
        userId: "me",
        type: dto.type,
        emotion: dto.emotion ?? null,
        createdAt: now,
        updatedAt: now,
        amount: dto.amount,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : now,
        note: dto.note ?? null,
        categoryId: dto.categoryId ?? null,
        accountId: dto.accountId,
        category: category
          ? {
              name: category.name,
              color: category.colorKey,
              icon: category.iconKey,
            }
          : null,
        account: { currency },
      };

      qc.setQueryData<Transaction[]>(["transactions"], (old) => {
        const list = old ?? [];
        return [optimisticTx, ...list];
      });

      qc.setQueryData<GetAccount[]>(["accounts"], (old) => {
        if (!old) return old;

        return old.map((acc: GetAccount) => {
          if (acc.id !== dto.accountId) return acc;

          const amount = Number(dto.amount);
          const nextBalance =
            dto.type === "INCOME"
              ? acc.balance + amount
              : dto.type === "EXPENSE"
                ? acc.balance - amount
                : amount;

          return { ...acc, balance: nextBalance };
        });
      });

      return { prevTransactions, prevAccounts };
    },
    onError: (_err, _dto, ctx) => {
      if (!ctx) return;
      qc.setQueryData(["transactions"], ctx.prevTransactions);
      qc.setQueryData(["accounts"], ctx.prevAccounts);
    },
  });
};
