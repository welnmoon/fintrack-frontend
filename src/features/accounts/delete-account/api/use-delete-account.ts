import { accountApi } from "@/entities/account/api/account.api";
import type {
  GetAccount,
  GetAccountOptions,
} from "@/entities/account/model/types.api";
import { dashboardQueryKey } from "@/features/get-dashboard/api/use-get-dashboard";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const accountsQueryKey = ["accounts"] as const;
const accountOptionsQueryKey = ["account-options"] as const;

export const useDeleteAccount = (accountId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      httpClient<{ id: string; deleted: true }>(accountApi.deleteAccount(accountId), {
        method: "DELETE",
        credentials: "include",
      }),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: accountsQueryKey });
      await qc.cancelQueries({ queryKey: accountOptionsQueryKey });

      const previousAccounts = qc.getQueryData<GetAccount[]>(accountsQueryKey);
      const previousAccountOptions =
        qc.getQueryData<GetAccountOptions[]>(accountOptionsQueryKey);

      qc.setQueryData<GetAccount[]>(accountsQueryKey, (old) =>
        old?.filter((account) => account.id !== accountId),
      );

      qc.setQueryData<GetAccountOptions[]>(accountOptionsQueryKey, (old) =>
        old?.filter((account) => account.id !== accountId),
      );

      return { previousAccounts, previousAccountOptions };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousAccounts) {
        qc.setQueryData(accountsQueryKey, context.previousAccounts);
      }

      if (context?.previousAccountOptions) {
        qc.setQueryData(accountOptionsQueryKey, context.previousAccountOptions);
      }
    },

    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: accountsQueryKey });
      await qc.invalidateQueries({ queryKey: accountOptionsQueryKey });
      await qc.invalidateQueries({ queryKey: [dashboardQueryKey] });
    },
  });
};
