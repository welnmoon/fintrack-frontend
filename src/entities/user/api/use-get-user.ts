import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "./user.api";
import type { User } from "../model/types.api";

export const useGetUser = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () =>
      httpClient<User>(useApi.getUser(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
