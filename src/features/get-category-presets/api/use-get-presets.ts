import { httpClient } from "@/shared/api/http-client";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "../../../entities/category/api/category.api";
import type { GetCategories } from "../model/types.api";

export const categoryPresetsQueryKey = "category-presets";

export const useGetCategoryPresets = () => {
  return useQuery({
    queryKey: [categoryPresetsQueryKey],
    queryFn: async () =>
      httpClient<GetCategories>(categoryApi.presets(), {
        method: "GET",
        credentials: "include",
      }),
  });
};
