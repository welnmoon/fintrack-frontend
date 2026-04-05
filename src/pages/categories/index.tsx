import {
  Badge,
  Card,
  CardContent,
  Skeleton,
} from "@/shared/ui";
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
import { useMemo } from "react";

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

  return (
    <PageContainer>
      <PageHeader
        title="Категории"
        description="Справочник доходных и расходных категорий."
      />
      <CreateCategoryForm />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`category-loading-${index}`}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </div>
                </div>
              ))}

            {!isLoading && isCategoriesError && (
              <p className="col-span-full text-sm text-destructive">
                Ошибка загрузки: {errorMessage}
              </p>
            )}

            {!isLoading && !isCategoriesError && (!categories || categories.length === 0) && (
              <p className="col-span-full text-sm text-muted-foreground">
                Категорий пока нет.
              </p>
            )}

            {!isLoading &&
              !isCategoriesError &&
              categories?.map((item) => {
                const transactionsCount =
                  transactionsCountByCategoryId.get(item.id) ?? 0;

                return (
                  <div
                    key={item.id}
                    className="flex h-full flex-col rounded-2xl border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/70">
                        <CategoryIconWithColor
                          colorKey={item.colorKey as CategoryColorKey}
                          iconKey={item.iconKey as CategoryIconKey}
                          key={item.id}
                        />
                      </div>
                      <CategoryActionsMenu
                        category={item}
                        transactionsCount={transactionsCount}
                      />
                    </div>

                    <div className="mt-4 min-w-0 flex-1">
                      <p
                        title={item.name}
                        className="min-h-10 break-words text-sm font-medium leading-5"
                      >
                        {item.name}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          item.type === "INCOME" ? "default" : "secondary"
                        }
                      >
                        {getCategoryTypeLabel(item.type)}
                      </Badge>
                      <span
                        title={formatCategoryTransactionsTooltip(
                          transactionsCount,
                        )}
                        className="inline-flex items-center rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {transactionsCount}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
