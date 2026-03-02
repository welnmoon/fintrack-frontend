import { transferApi } from "@/entities/transfer/api/transfer.api";
import { httpClient } from "@/shared/api/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTransferDto } from "../model/schema";
import type { CreateTransferResponse } from "../model/types.api";

export const useMakeTransfer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateTransferDto) =>
      httpClient<CreateTransferResponse>(transferApi.createUserTransfer(), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dto),
      }),
  });
};
