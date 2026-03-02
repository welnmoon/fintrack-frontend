import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "./user.api";
import type { User } from "../model/types.api";

export const useGetUser = () => {
  return useQuery({
    queryKey: ["me"],
    // staleTime: 10,
    queryFn: async () =>
      httpClient<User>(userApi.getUser(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
