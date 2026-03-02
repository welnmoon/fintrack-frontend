import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginResponse } from "../model/types.api";
import { httpClient } from "@/shared/api/http-client";
import { authApi } from "../model/auth.api";
import type { LoginSchemaType } from "../model/schema";

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginSchemaType) => {
      const res = await httpClient<LoginResponse>(authApi.login(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      console.log("Login response:", res);

      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
