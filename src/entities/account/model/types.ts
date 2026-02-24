import type { CurrencyCode } from '@/shared/types'

export type AccountType = 'Cash' | 'Debit Card' | 'Savings' | 'Crypto'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: CurrencyCode
}
