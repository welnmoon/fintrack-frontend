import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "./category.api";
import type { UserCategory } from "../model/types.api";

export const userCategoriesQueryKey = "categories";

export const useGetCategories = () => {
  return useQuery({
    queryKey: [userCategoriesQueryKey],
    queryFn: async () =>
      httpClient<UserCategory[]>(categoryApi.list(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
