import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "./transactions.api";
import type { Transaction } from "../model/types";

type RawTransaction = Omit<
  Transaction,
  "createdAt" | "updatedAt" | "occurredAt" | "category"
> & {
  createdAt: string;
  updatedAt: string;
  occurredAt: string;
  category:
    | {
        name: string;
        color?: string | null;
        icon?: string | null;
        colorKey?: string | null;
        iconKey?: string | null;
      }
    | null;
};

const normalizeTransaction = (transaction: RawTransaction): Transaction => ({
  ...transaction,
  createdAt: new Date(transaction.createdAt),
  updatedAt: new Date(transaction.updatedAt),
  occurredAt: new Date(transaction.occurredAt),
  category: transaction.category
    ? {
        name: transaction.category.name,
        color: transaction.category.color ?? transaction.category.colorKey ?? null,
        icon: transaction.category.icon ?? transaction.category.iconKey ?? null,
      }
    : null,
});

export const useGetTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () =>
      httpClient<RawTransaction[]>(transactionsApi.get(), {
        method: "GET",
        credentials: "include",
      }).then((items) => items.map(normalizeTransaction)),
  });
};
