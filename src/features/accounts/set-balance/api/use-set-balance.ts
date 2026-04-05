import { accountApi } from "@/entities/account/api/account.api";
import type { GetAccount } from "@/entities/account/model/types.api";
import { balanceHistoryQueryKey } from "@/features/get-dashboard/api/use-balance-history";
import { dashboardQueryKey } from "@/features/get-dashboard/api/use-get-dashboard";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetBalanceFormType } from "../model/schema";
import type { SetBalanceRequest } from "../model/types.api";

const accountsQueryKey = ["accounts"] as const;
const transactionsQueryKey = ["transactions"] as const;

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
      await qc.invalidateQueries({ queryKey: accountsQueryKey });
      await qc.invalidateQueries({ queryKey: transactionsQueryKey });
      await qc.invalidateQueries({ queryKey: [dashboardQueryKey] });
      await qc.invalidateQueries({ queryKey: [balanceHistoryQueryKey] });
    },
  });
};
