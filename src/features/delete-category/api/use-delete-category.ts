import { categoryApi } from "@/entities/category/api/category.api";
import { userCategoriesQueryKey } from "@/entities/category/api/use-get-categories";
import type { UserCategory } from "@/entities/category/model/types.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteCategory = (categoryId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      httpClient<UserCategory>(categoryApi.delete(categoryId), {
        method: "DELETE",
        credentials: "include",
      }),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: [userCategoriesQueryKey] });

      const previousCategories = qc.getQueryData<UserCategory[]>([
        userCategoriesQueryKey,
      ]);

      qc.setQueryData<UserCategory[]>([userCategoriesQueryKey], (old = []) =>
        old.filter((category) => category.id !== categoryId),
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
    },
  });
};
