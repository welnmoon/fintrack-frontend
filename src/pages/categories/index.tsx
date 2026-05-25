import { createElement, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Tag, X } from "lucide-react";
import { useGetCategories } from "@/entities/category/api/use-get-categories";
import type { UserCategory } from "@/entities/category/model/types.api";
import { useGetTransactions } from "@/entities/transaction/api/use-get-transactions";
import { useCreateCategory } from "@/features/create-category/api/use-create-category";
import {
  createCategorySchema,
  type CreateCategorySchemaInput,
  type CreateCategorySchemaType,
} from "@/features/create-category/model/schema";
import type { CreateCategoryDto } from "@/features/create-category/model/types.api";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { useGetCategoryPresets } from "@/features/get-category-presets/api/use-get-presets";
import { CategoryActionsMenu } from "@/features/update-category/ui/category-actions-menu";
import { ColorPicker } from "@/features/category-picker/ui/color-picker";
import { IconPicker } from "@/features/category-picker/ui/icon-picker";
import { CATEGORY_COLORS } from "@/shared/config/category-colors";
import { displayCategoryName } from "@/shared/lib/category/display-category-name";
import { cn } from "@/shared/lib";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";
import { Skeleton } from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

/* ─── Helpers ─── */
function resolveColor(colorKey?: string | null): string {
  if (!colorKey) return "#888888";
  try {
    return getCategoryColor(colorKey as CategoryColorKey);
  } catch {
    return "#888888";
  }
}

/* ─── Summary chip ─── */
function SummaryChip({
  num,
  label,
  dotColor,
}: {
  num: number;
  label: string;
  dotColor?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-[#E5E2D8] bg-white px-4 py-2.5">
      {dotColor && (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ background: dotColor }}
        />
      )}
      <span className="font-mono text-[20px] font-normal leading-none tracking-[-0.02em] text-[#1C1B18]">
        {num}
      </span>
      <span className="text-[12px] text-[#A09E96]">{label}</span>
    </div>
  );
}

/* ─── Filter tab ─── */
function FilterTab({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 whitespace-nowrap rounded-[7px] border-[1.5px] px-3.5 py-1.5 text-[12px] font-medium transition-all",
        active
          ? "border-[#1C1B18] bg-[#1C1B18] text-[#F5F3EE]"
          : "border-[#E5E2D8] text-[#8A8880] hover:border-[#C0BDB4] hover:text-[#4A4944]",
      )}
    >
      {children}
      <span
        className={cn(
          "rounded-[4px] px-1.5 py-[1px] text-[10px]",
          active ? "bg-white/20 text-white/80" : "bg-[#F0EDE5] text-[#A09E96]",
        )}
      >
        {count}
      </span>
    </button>
  );
}

/* ─── Group header ─── */
function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-5 pb-1 pt-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C0BDB4]">
        {label}
      </span>
      <span className="h-px flex-1 bg-[#F0EDE5]" />
      <span className="rounded-[5px] bg-[#F5F3EE] px-1.5 py-[1px] text-[10px] font-semibold text-[#C8C5BC]">
        {count}
      </span>
    </div>
  );
}

/* ─── Category row ─── */
function CategoryRow({
  category,
  txCount,
}: {
  category: UserCategory;
  txCount: number;
}) {
  const color = resolveColor(category.colorKey);
  const IconComp = category.iconKey
    ? (getCategoryIcon(category.iconKey as CategoryIconKey) ?? Tag)
    : Tag;
  const isIncome = category.type === "INCOME";

  return (
    <div className="flex items-center gap-2.5 border-t border-[#F5F3EE] px-5 py-2.5 transition-colors hover:bg-[#FAFAF7]">
      {/* Icon chip */}
      <div
        className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px]"
        style={{ background: color }}
      >
        {createElement(IconComp, { className: "h-4 w-4 text-white" })}
      </div>

      {/* Name */}
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium text-[#1C1B18]">
        {displayCategoryName(category.name)}
      </span>

      {/* Type badge */}
      <span
        className={cn(
          "flex-shrink-0 rounded-[6px] px-2.5 py-[3px] text-[11px] font-semibold",
          isIncome
            ? "bg-[#E0F0E4] text-[#266834]"
            : "bg-[#F5F2EA] text-[#7A6040]",
        )}
      >
        {isIncome ? "Доход" : "Расход"}
      </span>

      {/* Ops count */}
      <span className="min-w-[40px] flex-shrink-0 text-right font-mono text-[12px] text-[#C0BDB4]">
        {txCount} оп.
      </span>

      {/* Actions */}
      <CategoryActionsMenu
        category={category}
        transactionsCount={txCount}
        triggerClassName="h-[28px] w-[28px] rounded-[7px] text-[#C8C5BC] hover:bg-[#F0EDE5] hover:text-[#6A6860]"
      />
    </div>
  );
}

/* ─── Create category modal ─── */
function CreateCategoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: presets } = useGetCategoryPresets();
  const { mutate, isPending, error } = useCreateCategory();

  const form = useForm<CreateCategorySchemaInput>({
    defaultValues: {
      name: "",
      type: "EXPENSE",
      iconKey: undefined,
      colorKey: undefined,
    },
    resolver: zodResolver(createCategorySchema),
    mode: "onChange",
  });

  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedType = useWatch({ control: form.control, name: "type" });
  const watchedColorKey = useWatch({ control: form.control, name: "colorKey" });
  const watchedIconKey = useWatch({ control: form.control, name: "iconKey" });

  useEffect(() => {
    form.setValue("iconKey", undefined, { shouldDirty: true });
  }, [watchedType, form]);

  const iconEntries = useMemo(() => {
    const group = presets?.icons[watchedType ?? "EXPENSE"];
    if (!group) return [];
    return Object.entries(group).map(([key, v]) => ({
      key: key as CategoryIconKey,
      label: (v as { label: string }).label,
    }));
  }, [presets, watchedType]);

  const previewColor = watchedColorKey
    ? CATEGORY_COLORS[watchedColorKey]?.hex
    : "#888888";
  const PreviewIcon = watchedIconKey
    ? (getCategoryIcon(watchedIconKey as CategoryIconKey) ?? Tag)
    : Tag;
  const isIncome = watchedType === "INCOME";

  const onSubmit = (values: CreateCategorySchemaInput) => {
    const dto: CreateCategorySchemaType = createCategorySchema.parse(values);
    mutate(dto as CreateCategoryDto, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(20,20,18,0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E2D8] px-6 py-5">
          <span className="text-[16px] font-semibold text-[#1C1B18]">
            Новая категория
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#F2F0EA] text-[#6A6860] transition-colors hover:bg-[#E8E5DC]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Live preview */}
        <div className="flex items-center gap-4 border-b border-[#E5E2D8] bg-[#F8F7F3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] transition-colors"
              style={{ background: previewColor }}
            >
              {createElement(PreviewIcon, {
                className: "h-5 w-5 text-white",
              })}
            </div>
            <div>
              <p className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold text-[#1C1B18]">
                {watchedName?.trim() || "Название"}
              </p>
              <span
                className={cn(
                  "mt-0.5 inline-block rounded-[6px] px-2.5 py-[3px] text-[11px] font-semibold",
                  isIncome
                    ? "bg-[#E0F0E4] text-[#266834]"
                    : "bg-[#F5F2EA] text-[#7A6040]",
                )}
              >
                {isIncome ? "Доход" : "Расход"}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#C0BDB4]">
              Предпросмотр
            </p>
            <p className="mt-[2px] text-[11px] text-[#C0BDB4]">
              Так выглядит в списке
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#B0ADA4]">
                Название
              </label>
              <input
                {...form.register("name")}
                type="text"
                placeholder="Например: Продукты"
                className="w-full rounded-[9px] border-[1.5px] border-[#E5E2D8] bg-white px-3 py-2.5 text-[14px] text-[#1C1B18] outline-none transition-colors placeholder:text-[#C8C5BC] focus:border-[#A09E96]"
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-[12px] text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Type toggle */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#B0ADA4]">
                Тип
              </label>
              <div className="flex gap-1.5">
                {(
                  [
                    { value: "INCOME", label: "Доход" },
                    { value: "EXPENSE", label: "Расход" },
                  ] as const
                ).map((opt) => {
                  const active = watchedType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        form.setValue("type", opt.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border-[1.5px] py-2 text-[13px] font-medium transition-all",
                        active && opt.value === "INCOME"
                          ? "border-[#3A9A52] bg-[#E0F0E4] text-[#266834]"
                          : active && opt.value === "EXPENSE"
                            ? "border-[#E8A020] bg-[#FEF5E0] text-[#8A5A08]"
                            : "border-[#E5E2D8] text-[#8A8880] hover:border-[#C0BDB4] hover:text-[#4A4944]",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#B0ADA4]">
                Цвет
              </label>
              <ColorPicker
                colors={CATEGORY_COLORS}
                value={watchedColorKey as CategoryColorKey}
                onChange={(key) =>
                  form.setValue("colorKey", key, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[#B0ADA4]">
                Иконка
              </label>
              <IconPicker
                value={watchedIconKey as CategoryIconKey}
                onChange={(key) =>
                  form.setValue("iconKey", key, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                items={iconEntries}
                color={watchedColorKey as CategoryColorKey}
              />
              {(form.formState.errors.iconKey ||
                form.formState.errors.colorKey) && (
                <p className="mt-1 text-[12px] text-red-500">
                  Выберите иконку и цвет
                </p>
              )}
            </div>

            {error instanceof Error && (
              <p className="text-[13px] text-red-500">
                Ошибка создания: {error.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E5E2D8] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[9px] border-[1.5px] border-[#E5E2D8] px-[18px] py-[9px] text-[13px] text-[#7A7971] transition-colors hover:border-[#C8C5BC] hover:bg-[#F5F3EE]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending || !watchedColorKey || !watchedIconKey}
              className="rounded-[9px] bg-[#1C1B18] px-5 py-[9px] text-[13px] font-medium text-[#F5F3EE] transition-colors hover:bg-[#2E2D28] disabled:opacity-50"
            >
              {isPending ? "Создаю..." : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
type FilterType = "all" | "INCOME" | "EXPENSE";

export function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: categories, isLoading, isError, error } = useGetCategories();
  const { data: transactions } = useGetTransactions();

  const txCountByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions ?? []) {
      if (tx.categoryId) {
        map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [transactions]);

  const sortedCategories = useMemo(
    () =>
      [...(categories ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, "ru-RU", { sensitivity: "base" }),
      ),
    [categories],
  );

  const filteredCategories = useMemo(
    () =>
      sortedCategories.filter((c) => {
        const matchesFilter = activeFilter === "all" || c.type === activeFilter;
        const matchesSearch =
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          displayCategoryName(c.name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [sortedCategories, activeFilter, searchQuery],
  );

  const totalCount = categories?.length ?? 0;
  const incomeCount = (categories ?? []).filter(
    (c) => c.type === "INCOME",
  ).length;
  const expenseCount = (categories ?? []).filter(
    (c) => c.type === "EXPENSE",
  ).length;

  const incomeRows = filteredCategories.filter((c) => c.type === "INCOME");
  const expenseRows = filteredCategories.filter((c) => c.type === "EXPENSE");

  const errorMessage =
    error instanceof Error ? error.message : "Неизвестная ошибка";

  return (
    <PageContainer>
      <PageHeader
        title="Категории"
        description="Справочник доходных и расходных категорий."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-[7px] rounded-[10px] bg-[#1C1B18] px-[18px] py-[9px] text-[13px] font-medium text-[#F5F3EE] transition-colors hover:bg-[#2E2D28] active:scale-[0.97]"
          >
            <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5">
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Добавить
          </button>
        }
      />

      {/* Summary strip */}
      {!isLoading && (
        <div className="flex flex-wrap gap-3">
          <SummaryChip num={totalCount} label="категорий" />
          <SummaryChip num={incomeCount} label="доход" dotColor="#3A9A52" />
          <SummaryChip num={expenseCount} label="расход" dotColor="#E8A020" />
        </div>
      )}

      {/* Main list card */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E2D8] bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E2D8] px-5 py-3.5">
          {/* Search */}
          <div className="relative min-w-[160px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C0BDB4]" />
            <input
              type="text"
              placeholder="Поиск по категориям…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-[#E5E2D8] bg-[#FAFAF7] py-1.5 pl-8 pr-3 text-[13px] text-[#1C1B18] outline-none transition-colors placeholder:text-[#C8C5BC] focus:border-[#A09E96] focus:bg-white"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5">
            <FilterTab
              active={activeFilter === "all"}
              count={totalCount}
              onClick={() => setActiveFilter("all")}
            >
              Все
            </FilterTab>
            <FilterTab
              active={activeFilter === "INCOME"}
              count={incomeCount}
              onClick={() => setActiveFilter("INCOME")}
            >
              Доход
            </FilterTab>
            <FilterTab
              active={activeFilter === "EXPENSE"}
              count={expenseCount}
              onClick={() => setActiveFilter("EXPENSE")}
            >
              Расход
            </FilterTab>
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 border-t border-[#F5F3EE] px-5 py-2.5"
              >
                <Skeleton className="h-[34px] w-[34px] flex-shrink-0 rounded-[9px]" />
                <Skeleton className="h-4 w-44 flex-1" />
                <Skeleton className="h-6 w-14 rounded-[6px]" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-7 w-7 rounded-[7px]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="px-5 py-8 text-center text-[13px] text-red-500">
            Ошибка загрузки: {errorMessage}
          </p>
        ) : filteredCategories.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#C0BDB4]">
            {searchQuery ? "Ничего не найдено" : "Категорий пока нет"}
          </p>
        ) : (
          <>
            {incomeRows.length > 0 && (
              <>
                <GroupHeader label="Доход" count={incomeRows.length} />
                {incomeRows.map((c) => (
                  <CategoryRow
                    key={c.id}
                    category={c}
                    txCount={txCountByCat.get(c.id) ?? 0}
                  />
                ))}
              </>
            )}
            {expenseRows.length > 0 && (
              <>
                <GroupHeader label="Расход" count={expenseRows.length} />
                {expenseRows.map((c) => (
                  <CategoryRow
                    key={c.id}
                    category={c}
                    txCount={txCountByCat.get(c.id) ?? 0}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <CreateCategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </PageContainer>
  );
}
