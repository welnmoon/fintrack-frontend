import type { CurrencyCode } from "@/shared/types/currency";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  defaultCurrency: CurrencyCode;
  initials: string;
}
