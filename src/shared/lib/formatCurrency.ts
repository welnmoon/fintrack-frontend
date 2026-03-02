import type { CurrencyCode } from "../model/currency/schema";

const FALLBACK_CURRENCY: CurrencyCode = "KZT";

export function formatCurrency(value: number, currency?: string | null) {
  const requestedCurrency = currency ?? FALLBACK_CURRENCY;

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: requestedCurrency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: FALLBACK_CURRENCY,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
