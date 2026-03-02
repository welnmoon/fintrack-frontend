import z from "zod/v3";

export const setBalanceFormSchema = z.object({
  amount: z.coerce.number().min(0, "Баланс не может быть < 0"),
  note: z.string().trim().max(200, "Слишком длинно").optional(),
});

export type SetBalanceFormType = z.infer<typeof setBalanceFormSchema>;
