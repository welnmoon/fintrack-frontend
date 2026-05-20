import { Card, CardContent, Skeleton } from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import { useGetCategories } from "@/entities/category/api/use-get-categories";
import { useGetTransactions } from "@/entities/transaction/api/use-get-transactions";
import CreateCategoryForm from "@/features/create-category/ui/create-category-form";
import { CategoryIconWithColor } from "@/entities/category/ui/category-icon-with-color";
import { CategoryActionsMenu } from "@/features/update-category/ui/category-actions-menu";
import {
  formatCategoryTransactionsTooltip,
  getCategoryTypeLabel,
} from "@/entities/category/lib/category-type";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { useMemo } from "react";

function resolveCategoryColor(colorKey: string | null | undefined) {
  if (!colorKey) return "#888888";

  try {
    return getCategoryColor(colorKey as CategoryColorKey);
  } catch {
    return "#888888";
  }
}

export function CategoriesPage() {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGetCategories();
  const { data: transactions } = useGetTransactions();

  const isLoading = isCategoriesLoading;
  const errorMessage =
    categoriesError instanceof Error
      ? categoriesError.message
      : "Неизвестная ошибка";

  const transactionsCountByCategoryId = useMemo(() => {
    const counts = new Map<string, number>();

    for (const transaction of transactions ?? []) {
      if (!transaction.categoryId) continue;

      counts.set(
        transaction.categoryId,
        (counts.get(transaction.categoryId) ?? 0) + 1,
      );
    }

    return counts;
  }, [transactions]);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];

    return [...categories].sort((a, b) =>
      a.name.localeCompare(b.name, "ru-RU", { sensitivity: "base" }),
    );
  }, [categories]);

  const incomeCategories = sortedCategories.filter((item) => item.type === "INCOME");
  const expenseCategories = sortedCategories.filter(
    (item) => item.type === "EXPENSE",
  );

  return (
    <PageContainer>
      <PageHeader
        title="Категории"
        description="Справочник доходных и расходных категорий."
      />

      <CreateCategoryForm />

      <Card className="overflow-hidden">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#EDEAE4] px-6 py-4">
          <span className="text-[13px] font-semibold text-[#111]">Все категории</span>
          <span className="text-[11px] text-[#B5B0A8]">
            {(categories?.length ?? 0).toString()} категорий · сортировка по названию
          </span>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[40px_1fr_100px_80px_40px] gap-3 border-b border-[#EDEAE4] bg-[#FAFAF8] px-6 py-2.5">
                <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]" />
                <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
                  Название
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
                  Тип
                </span>
                <span className="text-center font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
                  Операций
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]" />
              </div>

              {isLoading ? (
                <div>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`category-loading-row-${index}`}
                      className="grid grid-cols-[40px_1fr_100px_80px_40px] items-center gap-3 border-b border-[#F4F2EE] px-6 py-3"
                    >
                      <Skeleton className="h-8 w-8 rounded-[8px]" />
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="mx-auto h-4 w-6" />
                      <Skeleton className="ml-auto h-6 w-6 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : isCategoriesError ? (
                <p className="px-6 py-6 text-sm text-destructive">
                  Ошибка загрузки: {errorMessage}
                </p>
              ) : !categories || categories.length === 0 ? (
                <p className="px-6 py-6 text-sm text-[#AAA49C]">Категорий пока нет.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 border-b border-[#EDEAE4] bg-[#FAFAF8] px-6 py-2.5">
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-[2px] text-[#AAA49C]">
                      {getCategoryTypeLabel("INCOME")}
                    </span>
                    <span className="rounded-full bg-[#EDEAE4] px-2 py-[1px] font-mono text-[9px] text-[#C0BCB4]">
                      {incomeCategories.length}
                    </span>
                  </div>

                  {incomeCategories.map((item) => {
                    const transactionsCount =
                      transactionsCountByCategoryId.get(item.id) ?? 0;
                    const color = resolveCategoryColor(item.colorKey);

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[40px_1fr_100px_80px_40px] items-center gap-3 border-b border-[#F4F2EE] px-6 py-3 transition-colors hover:bg-[#FAFAF8]"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-[8px]"
                          style={{ backgroundColor: `${color}1A` }}
                        >
                          <CategoryIconWithColor
                            colorKey={item.colorKey as CategoryColorKey}
                            iconKey={item.iconKey as CategoryIconKey}
                            size={15}
                          />
                        </div>
                        <span className="text-[13px] font-semibold text-[#111]">
                          {item.name}
                        </span>
                        <span className="w-fit rounded-full border border-[#C2EDD8] bg-[#EDFAF4] px-2.5 py-[3px] text-[10px] font-semibold text-[#1A9E6A]">
                          {getCategoryTypeLabel(item.type)}
                        </span>
                        <span
                          title={formatCategoryTransactionsTooltip(transactionsCount)}
                          className="text-center font-mono text-xs text-[#AAA49C]"
                        >
                          {transactionsCount}
                        </span>
                        <CategoryActionsMenu
                          category={item}
                          transactionsCount={transactionsCount}
                          triggerClassName="ml-auto h-7 w-7 rounded-full text-[#C0BCB4] hover:bg-[#F0EEE9] hover:text-[#888]"
                        />
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-2 border-y border-[#EDEAE4] bg-[#FAFAF8] px-6 py-2.5">
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-[2px] text-[#AAA49C]">
                      {getCategoryTypeLabel("EXPENSE")}
                    </span>
                    <span className="rounded-full bg-[#EDEAE4] px-2 py-[1px] font-mono text-[9px] text-[#C0BCB4]">
                      {expenseCategories.length}
                    </span>
                  </div>

                  {expenseCategories.map((item) => {
                    const transactionsCount =
                      transactionsCountByCategoryId.get(item.id) ?? 0;
                    const color = resolveCategoryColor(item.colorKey);

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[40px_1fr_100px_80px_40px] items-center gap-3 border-b border-[#F4F2EE] px-6 py-3 transition-colors hover:bg-[#FAFAF8] last:border-b-0"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-[8px]"
                          style={{ backgroundColor: `${color}1A` }}
                        >
                          <CategoryIconWithColor
                            colorKey={item.colorKey as CategoryColorKey}
                            iconKey={item.iconKey as CategoryIconKey}
                            size={15}
                          />
                        </div>
                        <span className="text-[13px] font-semibold text-[#111]">
                          {item.name}
                        </span>
                        <span className="w-fit rounded-full border border-[#EDEAE4] bg-[#F7F6F3] px-2.5 py-[3px] text-[10px] font-semibold text-[#888]">
                          {getCategoryTypeLabel(item.type)}
                        </span>
                        <span
                          title={formatCategoryTransactionsTooltip(transactionsCount)}
                          className="text-center font-mono text-xs text-[#AAA49C]"
                        >
                          {transactionsCount}
                        </span>
                        <CategoryActionsMenu
                          category={item}
                          transactionsCount={transactionsCount}
                          triggerClassName="ml-auto h-7 w-7 rounded-full text-[#C0BCB4] hover:bg-[#F0EEE9] hover:text-[#888]"
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
