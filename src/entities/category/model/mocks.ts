import type { Category } from '@/entities/category/model/types'

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Продукты', type: 'EXPENSE', color: '#22c55e' },
  { id: 'cat-2', name: 'Транспорт', type: 'EXPENSE', color: '#0ea5e9' },
  { id: 'cat-3', name: 'Развлечения', type: 'EXPENSE', color: '#f97316' },
  { id: 'cat-4', name: 'Основной доход', type: 'INCOME', color: '#6366f1' },
  { id: 'cat-5', name: 'Фриланс', type: 'INCOME', color: '#14b8a6' },
]
