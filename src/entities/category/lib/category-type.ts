import type { CategoryType } from "@/entities/category/model/types";

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  INCOME: "Доход",
  EXPENSE: "Расход",
};

export function getCategoryTypeLabel(type: CategoryType) {
  return CATEGORY_TYPE_LABELS[type];
}

export function formatCategoryTransactionsTooltip(count: number) {
  if (count === 1) {
    return "Используется в 1 транзакции";
  }

  return `Используется в ${count} транзакциях`;
}
