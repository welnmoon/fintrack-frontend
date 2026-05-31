import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { accountApi } from "./account.api";
import type { GetAccount } from "../model/types.api";

export const useGetAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    queryFn: async () =>
      httpClient<GetAccount[]>(accountApi.getAccounts(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
