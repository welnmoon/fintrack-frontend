import type { Account } from '@/entities/account/model/types'

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Основная карта',
    type: 'Debit Card',
    balance: 3250.44,
    currency: 'USD',
  },
  {
    id: 'acc-2',
    name: 'Накопительный счет',
    type: 'Savings',
    balance: 14820,
    currency: 'USD',
  },
  {
    id: 'acc-3',
    name: 'Наличные',
    type: 'Cash',
    balance: 410,
    currency: 'USD',
  },
  {
    id: 'acc-4',
    name: 'Крипто-кошелек',
    type: 'Crypto',
    balance: 860.9,
    currency: 'USD',
  },
]
