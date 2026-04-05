import type { CurrencyCode } from "@/shared/model/currency/schema";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  defaultCurrency: CurrencyCode;
  initials: string;
}
