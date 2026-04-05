import { categoryApi } from "@/entities/category/api/category.api";
import { userCategoriesQueryKey } from "@/entities/category/api/use-get-categories";
import type { UserCategory } from "@/entities/category/model/types.api";
import { dashboardQueryKey } from "@/features/get-dashboard/api/use-get-dashboard";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCategoryDto } from "@/features/create-category/model/types.api";

export const useUpdateCategory = (categoryId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCategoryDto) =>
      httpClient<UserCategory>(categoryApi.update(categoryId), {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(dto),
      }),

    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: [userCategoriesQueryKey] });

      const previousCategories = qc.getQueryData<UserCategory[]>([
        userCategoriesQueryKey,
      ]);

      qc.setQueryData<UserCategory[]>([userCategoriesQueryKey], (old = []) =>
        old.map((category) =>
          category.id === categoryId ? { ...category, ...dto } : category,
        ),
      );

      return { previousCategories };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousCategories) {
        qc.setQueryData([userCategoriesQueryKey], context.previousCategories);
      }
    },

    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: [userCategoriesQueryKey] });
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      await qc.invalidateQueries({ queryKey: [dashboardQueryKey] });
    },
  });
};
