import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginCredentials, LoginResponse } from "../model/types.api";
import { httpClient } from "@/shared/api/http-client";
import { authApi } from "../model/auth.api";

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
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
