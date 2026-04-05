import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import type { DashboardExpensePie } from "../model/types.api";

export const expensePieQueryKey = "expense-pie";

type UseExpensePieParams = {
  from?: Date;
  to?: Date;
  limit?: number;
};

function toDateParam(date: Date | undefined) {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const useExpensePie = ({ from, to, limit = 10 }: UseExpensePieParams) => {
  const fromParam = toDateParam(from);
  const toParam = toDateParam(to);

  return useQuery({
    queryKey: [expensePieQueryKey, fromParam, toParam, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (fromParam) params.set("from", fromParam);
      if (toParam) params.set("to", toParam);

      return httpClient<DashboardExpensePie>(
        `dashboard/expense-pie?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
    },
  });
};
