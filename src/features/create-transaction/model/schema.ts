import z from "zod/v3";

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Выберите счет"),

  categoryId: z.string().uuid("Некорректная категория").optional(),

  type: z.enum(["INCOME", "EXPENSE", "ADJUSTMENT"]),

  amount: z.coerce.number().positive("Сумма должна быть больше 0"),

  occurredAt: z
    .string()
    .min(1, "Дата обязательна")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Некорректная дата"),

  note: z.string().max(200, "Слишком длинный комментарий").optional(),
});

export type CreateTransactionType = z.infer<typeof createTransactionSchema>;
