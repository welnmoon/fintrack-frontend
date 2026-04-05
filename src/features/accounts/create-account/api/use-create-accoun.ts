import { accountApi } from "@/entities/account/api/account.api";
import type {
  GetAccount,
  GetAccountOptions,
} from "@/entities/account/model/types.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAccountSchemaType } from "../model/schema";

const accountsQueryKey = ["accounts"] as const;
const accountOptionsQueryKey = ["account-options"] as const;

export const useCreateAccount = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAccountSchemaType) =>
      httpClient(accountApi.createAccount(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dto),
      }),

    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: accountsQueryKey });
      await qc.cancelQueries({ queryKey: accountOptionsQueryKey });

      const previousAccounts = qc.getQueryData<GetAccount[]>(accountsQueryKey);
      const previousAccountOptions =
        qc.getQueryData<GetAccountOptions[]>(accountOptionsQueryKey);

      const optimisticId = `optimistic-${crypto.randomUUID()}`;
      const name = dto.name.trim();

      const optimisticAccount: GetAccount = {
        id: optimisticId,
        name,
        type: dto.type,
        currency: dto.currency,
        backgroundKey: dto.backgroundKey,
        accountNumber: null,
        initialBalance: 0,
        balance: 0,
      };

      const optimisticOption: GetAccountOptions = {
        id: optimisticId,
        name,
        type: dto.type,
        currency: dto.currency,
        backgroundKey: dto.backgroundKey,
      };

      qc.setQueryData<GetAccount[]>(accountsQueryKey, (old) => [
        optimisticAccount,
        ...(old ?? []),
      ]);
      qc.setQueryData<GetAccountOptions[]>(accountOptionsQueryKey, (old) => [
        optimisticOption,
        ...(old ?? []),
      ]);

      return { previousAccounts, previousAccountOptions };
    },

    onError: (_error, _dto, ctx) => {
      if (ctx?.previousAccounts) {
        qc.setQueryData(accountsQueryKey, ctx.previousAccounts);
      }

      if (ctx?.previousAccountOptions) {
        qc.setQueryData(accountOptionsQueryKey, ctx.previousAccountOptions);
      }
    },

    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: accountsQueryKey });
      await qc.invalidateQueries({ queryKey: accountOptionsQueryKey });
    },
  });
};
