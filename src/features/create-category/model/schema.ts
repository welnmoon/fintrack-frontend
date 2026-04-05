import z from "zod/v3";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Название категории обязательно")
    .max(40, "Максимум 40 символов"),
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Тип должен быть INCOME или EXPENSE" }),
  }),
  iconKey: z.custom<CategoryIconKey>().optional(),
  colorKey: z.custom<CategoryColorKey>().optional(),
});

export type CreateCategorySchemaInput = z.input<typeof createCategorySchema>;
export type CreateCategorySchemaType = z.output<typeof createCategorySchema>;
