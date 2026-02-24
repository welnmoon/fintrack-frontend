import type { CurrencyCode } from '@/shared/types'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  defaultCurrency: CurrencyCode
  initials: string
}
