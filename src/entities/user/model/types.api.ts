import type { CurrencyCode } from "@/shared/model/currency/schema";

// users - getMe
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  defaultCurrency?: CurrencyCode | null;
}
