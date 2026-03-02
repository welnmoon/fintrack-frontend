import { accountApi } from "@/entities/account/api/account.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAccountSchemaType } from "../model/schema";

export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAccountSchemaType) =>
      httpClient(accountApi.createAccount(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dto),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["accounts"] });
      //   await qc.refetchQueries({ queryKey: ["accounts"], type: "active" });
    },
  });
};
