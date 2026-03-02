import { accountApi } from "@/entities/account/api/account.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetBalanceFormType } from "../model/schema";
import type { SetBalanceRequest } from "../model/types.api";
import type { GetAccount } from "@/entities/account";

export const useSetBalance = (accountId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ dto }: { dto: SetBalanceFormType }) =>
      httpClient<SetBalanceRequest>(accountApi.setBalance(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          ...dto,
          type: "ADJUSTMENT",
          accountId,
          occurredAt: new Date().toISOString(),
        }),
      }),

    onMutate: async ({ dto }) => {
      await qc.cancelQueries({ queryKey: ["accounts", accountId] });

      const previous = qc.getQueryData<GetAccount>(["accounts", accountId]);

      qc.setQueryData<GetAccount>(["accounts", accountId], (old) => {
        if (!old) return old;
        return { ...old, balance: Number(dto.amount) };
      });

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(["accounts", accountId], ctx.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["accounts", accountId] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
