import type { CurrencyCode } from '@/shared/types'

export type TransactionKind = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  account: string
  amount: number
  currency: CurrencyCode
  kind: TransactionKind
  status: 'Completed' | 'Pending'
}
