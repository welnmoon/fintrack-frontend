import type { CurrencyCode } from "@/shared/model/currency/schema";

export type UpdateUserDto = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  updatedAt: Date;
  defaultCurrency: CurrencyCode;
};
