import z from "zod/v3";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Название категории обязательно")
    .max(40, "Максимум 40 символов"),
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Тип должен быть INCOME или EXPENSE" }),
  }),
  iconKey: z.string().optional(),
  colorKey: z.string().optional(),
});

export type CreateCategorySchemaType = z.infer<typeof createCategorySchema>;
