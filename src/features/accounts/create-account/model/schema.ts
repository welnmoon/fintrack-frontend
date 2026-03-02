import z from "zod/v3";

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Название аккаунта обязательно")
    .max(100, "Название слишком длинное"),

  type: z.enum(["BANK", "CASH"], {
    errorMap: () => ({ message: "Тип должен быть BANK или CASH" }),
  }),

  currency: z.enum(["KZT", "EUR", "USD"], {
    errorMap: () => ({ message: "Валюта должна быть KZT, EUR или USD" }),
  }),
});

export type CreateAccountSchemaType = z.infer<typeof createAccountSchema>;
