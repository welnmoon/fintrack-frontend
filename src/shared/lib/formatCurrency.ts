import type { CurrencyCode } from '@/shared/types'

export function formatCurrency(value: number, currency: CurrencyCode = 'USD') {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}
