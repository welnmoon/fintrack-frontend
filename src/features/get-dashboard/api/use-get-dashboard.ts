import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import type { GetDashboardResponse } from "../model/types.api";

export const dashboardQueryKey = ["dashboard", "transactions"];

export const useGetDashboard = () => {
  return useQuery({
    queryKey: dashboardQueryKey,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    queryFn: async () =>
      httpClient<GetDashboardResponse>("dashboard", {
        method: "GET",
        credentials: "include",
      }),
    staleTime: 0,
  });
};
