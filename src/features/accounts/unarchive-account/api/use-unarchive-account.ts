import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/entities/account/api/account.api";
import type { GetAccount } from "@/entities/account/model/types.api";
import { httpClient } from "@/shared/api/http-client";
import { invalidateFinancialData } from "@/shared/lib/query/invalidate-financial-data";

const archivedAccountsQueryKey = ["accounts", "archived"] as const;

export const useUnarchiveAccount = (accountId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      httpClient<{ id: string; unarchived: true }>(
        accountApi.unarchiveAccount(accountId),
        {
          method: "PATCH",
          credentials: "include",
        },
      ),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: archivedAccountsQueryKey });

      const previousArchivedAccounts =
        qc.getQueryData<GetAccount[]>(archivedAccountsQueryKey);

      qc.setQueryData<GetAccount[]>(archivedAccountsQueryKey, (old) =>
        old?.filter((account) => account.id !== accountId),
      );

      return { previousArchivedAccounts };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousArchivedAccounts) {
        qc.setQueryData(archivedAccountsQueryKey, context.previousArchivedAccounts);
      }
    },

    onSettled: async () => {
      await invalidateFinancialData(qc);
    },
  });
};
