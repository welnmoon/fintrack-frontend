import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import type {
  BalanceHistoryInterval,
  GetBalanceHistoryResponse,
} from "../model/types.api";

export const balanceHistoryQueryKey = "balance-history";

const defaultPointsByInterval: Record<BalanceHistoryInterval, number> = {
  day: 30,
  week: 12,
  month: 12,
};

export const useBalanceHistory = (
  interval: BalanceHistoryInterval,
  points?: number,
) => {
  const pointsValue = points ?? defaultPointsByInterval[interval];

  return useQuery({
    queryKey: [balanceHistoryQueryKey, interval, pointsValue],
    queryFn: async () => {
      const params = new URLSearchParams({
        interval,
        points: String(pointsValue),
      });

      return httpClient<GetBalanceHistoryResponse>(
        `dashboard/balance-history?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
    },
  });
};
