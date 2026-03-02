import { CURRENCY_CODES } from "@/shared/model/currency/schema";
import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.email().optional(),

  firstName: z.string().optional(),

  lastName: z.string().optional(),

  defaultCurrency: z.enum(CURRENCY_CODES).optional(),
});

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
