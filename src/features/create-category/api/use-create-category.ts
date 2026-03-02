import { categoryApi } from "@/entities/category/api/category.api";
import { userCategoriesQueryKey } from "@/entities/category/api/use-get-categories";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCategoryDto } from "../model/types.api";
import type { UserCategory } from "@/entities/category/model/types.api";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";

export const useCreateCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCategoryDto) =>
      httpClient<UserCategory[]>(categoryApi.create(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dto),
      }),
    onMutate: async (dto) => {
      qc.cancelQueries({ queryKey: [userCategoriesQueryKey] });

      const prev = qc.getQueryData<UserCategory[]>([userCategoriesQueryKey]);

      const optimisticCt: UserCategory = {
        colorKey: dto.colorKey as CategoryColorKey,
        createdAt: new Date(),
        iconKey: dto.iconKey as CategoryIconKey,
        name: dto.name,
        id: "new-category",
        type: dto.type,
        userId: "current",
        updatedAt: new Date(),
      };

      qc.setQueryData([userCategoriesQueryKey], (old: UserCategory[] = []) => [
        ...old,
        optimisticCt,
      ]);

      return { prev };
    },
    onError: (err, dto, ctx) => {
      qc.setQueryData([userCategoriesQueryKey], ctx?.prev);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [userCategoriesQueryKey] });
    },
  });
};
