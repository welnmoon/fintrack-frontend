import { accountApi } from "@/entities/account/api/account.api";
import type {
  GetAccount,
  GetAccountOptions,
} from "@/entities/account/model/types.api";
import type { AccountBackgroundKey } from "@/entities/account/lib/account-backgrounds";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const accountsQueryKey = ["accounts"] as const;
const accountOptionsQueryKey = ["account-options"] as const;

export const useUpdateAccountBackground = (accountId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ backgroundKey }: { backgroundKey: AccountBackgroundKey }) =>
      httpClient<{ id: string; backgroundKey: AccountBackgroundKey }>(
        accountApi.updateBackground(accountId),
        {
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify({ backgroundKey }),
        },
      ),

    onMutate: async ({ backgroundKey }) => {
      await qc.cancelQueries({ queryKey: accountsQueryKey });
      await qc.cancelQueries({ queryKey: accountOptionsQueryKey });

      const previousAccounts = qc.getQueryData<GetAccount[]>(accountsQueryKey);
      const previousAccountOptions =
        qc.getQueryData<GetAccountOptions[]>(accountOptionsQueryKey);

      qc.setQueryData<GetAccount[]>(accountsQueryKey, (old) =>
        old?.map((account) =>
          account.id === accountId ? { ...account, backgroundKey } : account,
        ),
      );

      qc.setQueryData<GetAccountOptions[]>(accountOptionsQueryKey, (old) =>
        old?.map((account) =>
          account.id === accountId ? { ...account, backgroundKey } : account,
        ),
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
    },
  });
};
