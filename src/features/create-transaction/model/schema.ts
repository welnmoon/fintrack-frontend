import z from "zod/v3";
import { TRANSACTION_EMOTIONS } from "@/entities/transaction/model/types";

export const createTransactionSchema = z
  .object({
    accountId: z.string().uuid("Выберите счет"),

    categoryId: z.string().uuid("Некорректная категория").optional(),

    type: z.enum(["INCOME", "EXPENSE", "ADJUSTMENT"]),

    amount: z.coerce.number().positive("Сумма должна быть больше 0"),

    occurredAt: z
      .string()
      .min(1, "Дата обязательна")
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Некорректная дата",
      ),
    accountSum: z.coerce.number().optional(),

    note: z.string().max(200, "Слишком длинный комментарий").optional(),

    emotion: z.enum(TRANSACTION_EMOTIONS).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.type === "INCOME" || data.type === "EXPENSE") &&
      !data.categoryId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Выберите категорию",
        path: ["categoryId"],
      });
    }
  });

export type CreateTransactionType = z.infer<typeof createTransactionSchema>;
