import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "./transactions.api";
import type { Transaction } from "../model/types";

export const useGetTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () =>
      httpClient<Transaction[]>(transactionsApi.get(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
