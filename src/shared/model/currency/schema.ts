import { z } from "zod";

export const CURRENCY_CODES = ["USD", "EUR", "KZT"] as const;

export const currencyCodeSchema = z.enum(CURRENCY_CODES);

export type CurrencyCode = (typeof CURRENCY_CODES)[number];
