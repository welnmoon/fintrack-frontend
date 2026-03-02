import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../model/auth.api";
import type { RegisterSchemaType } from "../model/schema";
import type { AuthResponseDto } from "../model/types.api";

export const useRegister = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: RegisterSchemaType) =>
      httpClient<AuthResponseDto>(authApi.register(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
