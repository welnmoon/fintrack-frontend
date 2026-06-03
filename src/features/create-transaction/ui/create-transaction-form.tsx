import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { getAccountBackgroundClassName } from "@/entities/account/lib/account-backgrounds";
import { useGetCategories } from "@/entities/category/api/use-get-categories";
import { HashLoader } from "react-spinners";
import {
  getTransactionEmotionMeta,
  transactionEmotionOptions,
  type TransactionType,
} from "@/entities/transaction";
import { DEFAULT_CATEGORY_COLOR } from "@/shared/const/category";
import { cn } from "@/shared/lib";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";
import { Button, Input, Label, Separator, Textarea } from "@/shared/ui";
import { useCreateTransaction } from "../api/use-create-transaction";
import {
  createTransactionSchema,
  type CreateTransactionType,
} from "../model/schema";

type CreateTransactionFormProps = {
  type?: TransactionType;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSubmitStart?: () => void;
};

const CURRENCY_SYMBOL: Record<string, string> = {
  KZT: "₸",
  USD: "$",
  EUR: "€",
};

const transactionTypeOptions: Array<{ value: TransactionType; label: string }> =
  [
    { value: "INCOME", label: "Доход" },
    { value: "EXPENSE", label: "Расход" },
    { value: "ADJUSTMENT", label: "Корректировка" },
  ];

const getDefaultOccurredAtValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const toOccurredAtIso = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const now = new Date();
  const isToday =
    year === now.getFullYear() &&
    month === now.getMonth() + 1 &&
    day === now.getDate();
  const date = isToday
    ? new Date(
        year,
        month - 1,
        day,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        0,
      )
    : new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.toISOString();
};

const getDefaultValues = (
  fixedType?: TransactionType,
): CreateTransactionType => ({
  accountId: "",
  categoryId: undefined,
  type: fixedType ?? "EXPENSE",
  amount: 0,
  occurredAt: getDefaultOccurredAtValue(),
  note: undefined,
  emotion: undefined,
});

const submitLabelByType: Partial<Record<TransactionType, string>> = {
  EXPENSE: "Добавить расход",
  INCOME: "Добавить доход",
  ADJUSTMENT: "Добавить корректировку",
};

function resolveCategoryColor(colorKey: string | null | undefined): string {
  if (!colorKey) return DEFAULT_CATEGORY_COLOR;
  try {
    return getCategoryColor(colorKey as CategoryColorKey);
  } catch {
    return DEFAULT_CATEGORY_COLOR;
  }
}

function resolveCategoryIcon(iconKey: string | null | undefined): LucideIcon {
  if (!iconKey) return Tag;
  try {
    return getCategoryIcon(iconKey as CategoryIconKey) ?? Tag;
  } catch {
    return Tag;
  }
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
    {children}
  </p>
);

const CreateTransactionForm = ({
  type: fixedType,
  onSuccess,
  onCancel,
  onSubmitStart,
}: CreateTransactionFormProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const advancedRef = useRef<HTMLDivElement>(null);

  const { data: user } = useGetUser();
  const { data: accountOptions, isLoading: isAccountsLoading } =
    useGetAccountOptions();
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategories();
  const {
    mutate: createTransaction,
    isPending,
    error: createTransactionError,
  } = useCreateTransaction();

  const form = useForm<CreateTransactionType>({
    defaultValues: getDefaultValues(fixedType),
    resolver: zodResolver(createTransactionSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!fixedType) return;
    form.setValue("type", fixedType, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [fixedType, form]);

  const selectedType = useWatch({ control: form.control, name: "type" });
  const selectedAccountId = useWatch({
    control: form.control,
    name: "accountId",
  });
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const watchedNote = useWatch({ control: form.control, name: "note" });
  const watchedEmotion = useWatch({ control: form.control, name: "emotion" });

  const effectiveType = fixedType ?? selectedType;
  const isAdjustment = effectiveType === "ADJUSTMENT";

  useEffect(() => {
    if (!isAdjustment) return;
    form.setValue("categoryId", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, isAdjustment]);

  useEffect(() => {
    if (!accountOptions || accountOptions.length === 0) return;
    if (form.getValues("accountId")) return;
    const preferredAccountId = user?.defaultAccountId;
    const defaultAccountId =
      (preferredAccountId &&
        accountOptions.find((item) => item.id === preferredAccountId)?.id) ||
      accountOptions[0].id;
    form.setValue("accountId", defaultAccountId, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [accountOptions, form, user]);

  useEffect(() => {
    if (effectiveType === "EXPENSE") return;
    form.setValue("emotion", undefined, { shouldDirty: true });
  }, [effectiveType, form]);

  const filteredCategories =
    categories?.filter((cat) => {
      if (effectiveType === "INCOME" || effectiveType === "EXPENSE") {
        return cat.type === effectiveType;
      }
      return true;
    }) ?? [];

  const selectedAccount =
    accountOptions?.find((a) => a.id === selectedAccountId) ?? null;
  const currencySymbol = selectedAccount
    ? (CURRENCY_SYMBOL[selectedAccount.currency] ?? selectedAccount.currency)
    : "₸";

  const amountNum = (watchedAmount as number) || 0;
  const amountPreview =
    amountNum > 0
      ? amountNum.toLocaleString("ru-RU", { maximumFractionDigits: 2 })
      : null;

  const onSubmit = (values: CreateTransactionType) => {
    if (isPending) return;
    onSubmitStart?.();
    createTransaction(
      {
        ...values,
        note: values.note?.trim() || undefined,
        occurredAt: toOccurredAtIso(values.occurredAt),
      },
      {
        onSuccess: () => {
          form.reset(getDefaultValues(fixedType));
          setIsAdvancedOpen(false);
          onSuccess?.();
        },
      },
    );
  };

  const amountError = form.formState.errors.amount?.message;
  const categoryError = form.formState.errors.categoryId?.message;
  const accountError = form.formState.errors.accountId?.message;
  const dateError = form.formState.errors.occurredAt?.message;
  const noteError = form.formState.errors.note?.message;
  const typeError = form.formState.errors.type?.message;

  // Open accordion if account error fires on submit
  useEffect(() => {
    if (accountError) setIsAdvancedOpen(true);
  }, [accountError]);

  const hasNoAccounts = !isAccountsLoading && accountOptions?.length === 0;

  if (hasNoAccounts) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center">
        <p className="text-sm font-medium">Нет доступных счетов</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Сначала создайте счёт, чтобы добавить операцию.
        </p>
      </div>
    );
  }

  // Extra-section summary tags
  const extraTags: { label: string; accent?: boolean }[] = [];
  if (selectedAccount) {
    extraTags.push({ label: selectedAccount.name });
  }
  if (watchedEmotion) {
    const meta = getTransactionEmotionMeta(watchedEmotion);
    extraTags.push({ label: `${meta.emoji} ${meta.shortLabel}`, accent: true });
  }
  if ((watchedNote as string | undefined)?.trim()) {
    extraTags.push({ label: "✎", accent: true });
  }

  return (
    <form
      className="mt-4 space-y-5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* ── Amount ── */}
      <div>
        <FieldLabel>Сумма</FieldLabel>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border bg-muted/30 px-4 transition-all focus-within:border-ring focus-within:bg-background focus-within:shadow-[0_0_0_3px_hsl(var(--ring)/0.12)]",
            amountError &&
              "border-destructive focus-within:border-destructive focus-within:shadow-[0_0_0_3px_hsl(var(--destructive)/0.12)]",
          )}
        >
          <span className="font-mono text-xl text-muted-foreground select-none">
            {currencySymbol}
          </span>
          <Controller
            name="amount"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                inputMode="decimal"
                min={0}
                step="10"
                autoFocus
                placeholder="0"
                className="h-auto border-0 bg-transparent px-0 py-3 font-mono text-4xl font-semibold tracking-tight shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                onFocus={(e) => e.target.select()}
                value={(field.value as number | string | undefined) ?? ""}
              />
            )}
          />
        </div>
        {amountError && (
          <p className="mt-1.5 text-xs text-destructive">{amountError}</p>
        )}
      </div>

      {/* ── Type toggle ── */}
      {!fixedType && (
        <div>
          <FieldLabel>Тип операции</FieldLabel>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <div className="flex gap-1 rounded-xl border border-border/70 bg-muted/10 p-1">
                {transactionTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150",
                      field.value === option.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />
          {typeError && (
            <p className="mt-1.5 text-xs text-destructive">{typeError}</p>
          )}
        </div>
      )}

      {/* ── Category chips ── */}
      {!isAdjustment && (
        <div>
          <FieldLabel>Категория</FieldLabel>
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field }) => {
              if (isCategoriesLoading) {
                return (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <HashLoader
                      size={14}
                      color="hsl(var(--muted-foreground))"
                    />
                    <span>Загрузка категорий...</span>
                  </div>
                );
              }

              return (
                <div
                  className={cn(
                    "grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6 rounded-xl border p-2 bg-muted/10 transition-colors",
                    categoryError && "border-destructive",
                  )}
                >
                  {filteredCategories.map((cat) => {
                    const isSelected = field.value === cat.id;
                    const color = resolveCategoryColor(cat.colorKey);
                    const Icon = resolveCategoryIcon(cat.iconKey);

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => field.onChange(cat.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition-all",
                          isSelected
                            ? "border-ring bg-ring/10 shadow-[0_0_0_2px_hsl(var(--ring)/0.15)]"
                            : "border-transparent bg-transparent hover:border-border/50 hover:bg-muted/40",
                        )}
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{ background: `${color}22` }}
                        >
                          {createElement(Icon, {
                            className: "h-3.5 w-3.5",
                            style: { color },
                          })}
                        </span>
                        <span
                          className={cn(
                            "line-clamp-1 max-w-full text-[10px] font-medium leading-tight",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}

                  {filteredCategories.length === 0 && (
                    <p className="col-span-full py-3 text-center text-xs text-muted-foreground">
                      Категорий пока нет
                    </p>
                  )}
                </div>
              );
            }}
          />
          {categoryError && (
            <p className="mt-1.5 text-xs text-destructive">{categoryError}</p>
          )}
        </div>
      )}

      <Separator />

      {/* ── Advanced accordion ── */}
      <div>
        <button
          type="button"
          onClick={() => setIsAdvancedOpen((p) => !p)}
          aria-expanded={isAdvancedOpen}
          className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Дополнительно
            </span>
            {extraTags.length > 0 && !isAdvancedOpen && (
              <div className="flex flex-wrap items-center gap-1">
                {extraTags.map((t, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      t.accent
                        ? "border-ring/30 bg-ring/10 text-foreground"
                        : "border-border/60 bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          {isAdvancedOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        <div
          ref={advancedRef}
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isAdvancedOpen ? "mt-3 max-h-[600px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="space-y-4 rounded-xl border border-dashed border-border/60 bg-muted/5 px-4 py-4">
            {/* Account */}
            <div>
              <FieldLabel>Счёт</FieldLabel>
              <Controller
                name="accountId"
                control={form.control}
                render={({ field }) => {
                  if (isAccountsLoading) {
                    return (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HashLoader
                          size={14}
                          color="hsl(var(--muted-foreground))"
                        />
                        <span>Загрузка счетов...</span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-wrap gap-2">
                      {accountOptions?.map((account) => {
                        const isSelected = field.value === account.id;
                        return (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => field.onChange(account.id)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                              isSelected
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/70 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "h-2.5 w-2.5 shrink-0 rounded-full",
                                getAccountBackgroundClassName(
                                  account.backgroundKey,
                                ),
                              )}
                            />
                            {account.name}
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                isSelected
                                  ? "bg-background/20 text-background"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {account.currency}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                }}
              />
              {accountError && (
                <p className="mt-1.5 text-xs text-destructive">{accountError}</p>
              )}
            </div>

            {/* Emotion — EXPENSE only */}
            {effectiveType === "EXPENSE" && (
              <div>
                <FieldLabel>Настроение при трате</FieldLabel>
                <Controller
                  name="emotion"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => field.onChange(undefined)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                          !field.value
                            ? "border-primary/30 bg-primary/10 text-foreground"
                            : "border-dashed border-border/60 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Без эмоции
                      </button>
                      {transactionEmotionOptions.map((option) => {
                        const isSelected = field.value === option.value;
                        const meta = getTransactionEmotionMeta(option.value);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                              meta.badgeClassName,
                              !isSelected && "opacity-60 hover:opacity-90",
                              isSelected &&
                                "opacity-100 ring-2 ring-ring ring-offset-1",
                            )}
                          >
                            <span aria-hidden>{option.emoji}</span>
                            {option.shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Помогает отслеживать импульсивные и нежелательные траты.
                </p>
              </div>
            )}

            {/* Date */}
            <div>
              <Label
                htmlFor="create-transaction-date"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Дата
              </Label>
              <Controller
                name="occurredAt"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="create-transaction-date"
                    type="date"
                    className={cn(
                      dateError &&
                        "border-destructive focus-visible:ring-destructive/20",
                    )}
                    value={(field.value as string | undefined) ?? ""}
                  />
                )}
              />
              {dateError && (
                <p className="mt-1.5 text-xs text-destructive">{dateError}</p>
              )}
            </div>

            {/* Note */}
            <div>
              <Label
                htmlFor="create-transaction-note"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Комментарий
              </Label>
              <Controller
                name="note"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="create-transaction-note"
                    rows={2}
                    maxLength={200}
                    placeholder="Например: кофе перед работой"
                    className={cn(
                      "min-h-[70px] resize-none",
                      noteError &&
                        "border-destructive focus-visible:ring-destructive/20",
                    )}
                    value={(field.value as string | undefined) ?? ""}
                  />
                )}
              />
              {noteError && (
                <p className="mt-1.5 text-xs text-destructive">{noteError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {createTransactionError instanceof Error && (
        <p className="text-sm text-destructive">
          Ошибка: {createTransactionError.message}
        </p>
      )}

      <Separator />

      {/* ── Submit button ── */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-foreground px-5 py-4 text-background transition-all",
          "hover:-translate-y-px hover:shadow-lg hover:bg-foreground/90",
          "active:translate-y-0 active:shadow-none",
          "disabled:pointer-events-none disabled:opacity-60",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {isPending
              ? "Сохраняю..."
              : (submitLabelByType[effectiveType] ?? "Сохранить")}
          </span>
          {amountPreview && !isPending && (
            <span className="font-mono text-sm text-background/55">
              {currencySymbol} {amountPreview}
            </span>
          )}
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/10 text-sm transition-all group-hover:translate-x-0.5 group-hover:bg-background/20">
          →
        </span>
      </button>

      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={onCancel}
        >
          Отмена
        </Button>
      )}
    </form>
  );
};

export default CreateTransactionForm;
