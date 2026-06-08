import { accountApi } from "@/entities/account/api/account.api";
import type { GetAccount } from "@/entities/account/model/types.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetBalanceFormType } from "../model/schema";
import type { SetBalanceRequest } from "../model/types.api";
import { invalidateFinancialData } from "@/shared/lib/query/invalidate-financial-data";

const accountsQueryKey = ["accounts"] as const;
export const useSetBalance = (accountId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dto }: { dto: SetBalanceFormType }) =>
      httpClient<SetBalanceRequest>(accountApi.setBalance(accountId), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          ...dto,
        }),
      }),

    onMutate: async ({ dto }) => {
      await qc.cancelQueries({ queryKey: accountsQueryKey });

      const previousAccounts = qc.getQueryData<GetAccount[]>(accountsQueryKey);

      qc.setQueryData<GetAccount[]>(accountsQueryKey, (old) => {
        if (!old) return old;

        return old.map((account) =>
          account.id === accountId
            ? { ...account, balance: Number(dto.amount) }
            : account,
        );
      });

      return { previousAccounts };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousAccounts) {
        qc.setQueryData(accountsQueryKey, ctx.previousAccounts);
      }
    },

    onSettled: async () => {
      await invalidateFinancialData(qc);
    },
  });
};
