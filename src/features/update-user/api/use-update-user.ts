import { userApi } from "@/entities/user/api/user.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserSchemaType } from "../model/update-user-schema";
import type { UpdateUserDto } from "../model/types.api";

export const useUpdateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateUserSchemaType) =>
      httpClient<UpdateUserDto>(userApi.update(), {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
