import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../model/auth.api";

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      httpClient<void>(authApi.logout(), {
        method: "POST",
        credentials: "include",
      }),
    onSuccess: () => {
      qc.setQueryData(["me"], null);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
