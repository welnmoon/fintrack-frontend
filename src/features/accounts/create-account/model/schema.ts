import z from "zod/v3";
import {
  ACCOUNT_BACKGROUND_OPTIONS,
  DEFAULT_ACCOUNT_BACKGROUND_KEY,
  type AccountBackgroundKey,
} from "@/entities/account/lib/account-backgrounds";

const accountBackgroundValues = ACCOUNT_BACKGROUND_OPTIONS.map(
  (option) => option.value,
) as [AccountBackgroundKey, ...AccountBackgroundKey[]];

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

  backgroundKey: z
    .enum(accountBackgroundValues)
    .default(DEFAULT_ACCOUNT_BACKGROUND_KEY),
});

export type CreateAccountSchemaInput = z.input<typeof createAccountSchema>;
export type CreateAccountSchemaType = z.output<typeof createAccountSchema>;
