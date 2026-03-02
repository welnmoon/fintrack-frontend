import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import type { GetDashboardResponse } from "../model/types.api";

export const dashboardQueryKey = "dashboard";

export const useGetDashboard = () => {
  return useQuery({
    queryKey: [dashboardQueryKey],
    queryFn: async () =>
      httpClient<GetDashboardResponse>("dashboard", {
        method: "GET",
        credentials: "include",
      }),
  });
};
