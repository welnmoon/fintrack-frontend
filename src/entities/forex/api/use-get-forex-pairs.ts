import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/shared/api/http-client";

export type ForexPairTickerItem = {
  symbol: string;
  interval: string;
  lastPrice: number;
  previousPrice: number | null;
  changePercent: number | null;
  updatedAt: string;
};

export const useGetForexPairs = () => {
  return useQuery({
    queryKey: ["forex", "pairs"],
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    queryFn: () =>
      httpClient<ForexPairTickerItem[]>("forex/pairs", {
        method: "GET",
      }),
  });
};
