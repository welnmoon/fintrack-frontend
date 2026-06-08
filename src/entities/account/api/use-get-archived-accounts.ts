import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { accountApi } from "./account.api";
import type { GetAccount } from "../model/types.api";

export const useGetArchivedAccounts = () => {
  return useQuery({
    queryKey: ["accounts", "archived"],
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    queryFn: async () =>
      httpClient<GetAccount[]>(accountApi.getArchivedAccounts(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
