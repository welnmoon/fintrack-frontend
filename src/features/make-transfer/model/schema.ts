import z from "zod/v3";

export const createTransferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
});

export type CreateTransferDto = z.infer<typeof createTransferSchema>;
