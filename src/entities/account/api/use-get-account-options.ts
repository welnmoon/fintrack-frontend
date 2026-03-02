import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/shared/api/http-client";
import { accountApi } from "./account.api";
import type { GetAccountOptions } from "../model/types.api";

export const useGetAccountOptions = () => {
  return useQuery({
    queryKey: ["account-options"],

    queryFn: () =>
      httpClient<GetAccountOptions[]>(accountApi.getAccountOptions(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
