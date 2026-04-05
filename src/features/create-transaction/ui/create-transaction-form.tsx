import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import {
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  CreditCard,
  MessageSquareText,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
import { getAccountBackgroundClassName } from "@/entities/account/lib/account-backgrounds";
import { useGetCategories } from "@/entities/category/api/use-get-categories";
import type { GetAccountOptions } from "@/entities/account/model/types.api";
import type { UserCategory } from "@/entities/category/model/types.api";
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
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Textarea,
} from "@/shared/ui";
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

const NO_CATEGORY_VALUE = "__none__";
const ACCOUNT_NAME_MARQUEE_THRESHOLD = 18;

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
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString();
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
  ADJUSTMENT: "Сохранить корректировку",
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

const ScrollingText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const shouldAnimate = text.length > ACCOUNT_NAME_MARQUEE_THRESHOLD;

  if (!shouldAnimate) {
    return (
      <span className={cn("block truncate", className)} title={text}>
        {text}
      </span>
    );
  }

  return (
    <span className="relative block overflow-hidden whitespace-nowrap" title={text}>
      <span
        className={cn(
          "inline-flex min-w-max items-center gap-6 pr-6 group-hover:[animation:inline-marquee_6s_linear_infinite]",
          className,
        )}
      >
        <span>{text}</span>
        <span aria-hidden>{text}</span>
      </span>
    </span>
  );
};

const CategoryOptionContent = ({
  category,
}: {
  category: UserCategory | null;
}) => {
  const color = resolveCategoryColor(category?.colorKey);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/75">
        {createElement(resolveCategoryIcon(category?.iconKey), {
          className: "h-4 w-4",
          style: { color },
        })}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {category?.name ?? "Без категории"}
        </p>
        <p className="text-xs text-muted-foreground">
          {category ? (category.type === "INCOME" ? "Доход" : "Расход") : "Без привязки"}
        </p>
      </div>
    </div>
  );
};

const AccountOptionContent = ({
  account,
}: {
  account: GetAccountOptions;
}) => {
  return (
    <div className="group flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/75 text-muted-foreground">
        {createElement(
          account.type === "BANK" ? CreditCard : CircleDollarSign,
          {
            className: "h-4 w-4",
          },
        )}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ScrollingText
          text={account.name}
          className="text-sm font-medium text-foreground"
        />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
          {account.currency}
        </span>
        <span
          aria-hidden
          className={cn(
            "h-7 w-10 shrink-0 rounded-lg border border-white/20 shadow-sm",
            getAccountBackgroundClassName(account.backgroundKey),
          )}
        />
      </div>
    </div>
  );
};

const CreateTransactionForm = ({
  type: fixedType,
  onSuccess,
  onCancel,
  onSubmitStart,
}: CreateTransactionFormProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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
  const effectiveType = fixedType ?? selectedType;
  const isAdjustment = effectiveType === "ADJUSTMENT";

  useEffect(() => {
    if (!isAdjustment) return;

    form.setValue("categoryId", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, isAdjustment]);

  const filteredCategories =
    categories?.filter((category) => {
      if (effectiveType === "INCOME" || effectiveType === "EXPENSE") {
        return category.type === effectiveType;
      }

      return true;
    }) ?? [];

  const accountPlaceholder = accountOptions?.length
    ? "Выберите счет"
    : "Счетов пока нет";
  const categoryPlaceholder = isAdjustment
    ? "Не используется для корректировки"
    : filteredCategories.length
      ? "Выберите категорию"
      : "Категорий пока нет";

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

  return (
    <Card className="mt-5 border-border/70 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <form
          className="space-y-5"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label
              htmlFor="create-transaction-amount"
              className="text-xs uppercase tracking-[0.16em] text-muted-foreground"
            >
              Сумма
            </Label>
            <div
              className={cn(
                "rounded-2xl border border-border/70 bg-muted/10 px-4 py-3 transition-colors focus-within:border-ring",
                amountError && "border-red-400 focus-within:border-red-400",
              )}
            >
              <Controller
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="create-transaction-amount"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="10"
                    autoFocus
                    placeholder="0"
                    className="h-auto border-0 bg-transparent px-0 py-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
                    onFocus={(event) => event.target.select()}
                    value={(field.value as number | string | undefined) ?? ""}
                  />
                )}
              />
            </div>
            {amountError && <p className="text-xs text-red-500">{amountError}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
            <div className="space-y-2">
              <Label htmlFor="create-transaction-category">Категория</Label>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => {
                  const selectedCategory =
                    filteredCategories.find((item) => item.id === field.value) ??
                    null;

                  return (
                    <Select
                      disabled={isAdjustment || isCategoriesLoading}
                      onValueChange={(value) =>
                        field.onChange(
                          value === NO_CATEGORY_VALUE ? undefined : value,
                        )
                      }
                      value={(field.value as string | undefined) ?? NO_CATEGORY_VALUE}
                    >
                      <SelectTrigger
                        id="create-transaction-category"
                        className={cn(
                          "h-auto min-h-14 justify-start px-3 py-2.5 text-left",
                          categoryError && "border-red-400 focus:ring-red-400",
                        )}
                      >
                        {isCategoriesLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <HashLoader
                              size={16}
                              color="hsl(var(--muted-foreground))"
                            />
                            <span>Загрузка категорий...</span>
                          </div>
                        ) : selectedCategory ? (
                          <CategoryOptionContent category={selectedCategory} />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {categoryPlaceholder}
                          </span>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_CATEGORY_VALUE} className="py-2.5">
                          <CategoryOptionContent category={null} />
                        </SelectItem>
                        {filteredCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="py-2.5"
                          >
                            <CategoryOptionContent category={category} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {categoryError && <p className="text-xs text-red-500">{categoryError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-transaction-account">Счет</Label>
              <Controller
                name="accountId"
                control={form.control}
                render={({ field }) => {
                  const selectedAccount =
                    accountOptions?.find((item) => item.id === field.value) ?? null;

                  return (
                    <Select
                      disabled={isAccountsLoading || !accountOptions?.length}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="create-transaction-account"
                        className={cn(
                          "h-auto min-h-14 justify-start px-3 py-2.5 text-left",
                          accountError && "border-red-400 focus:ring-red-400",
                        )}
                      >
                        {isAccountsLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <HashLoader
                              size={16}
                              color="hsl(var(--muted-foreground))"
                            />
                            <span>Загрузка счетов...</span>
                          </div>
                        ) : selectedAccount ? (
                          <AccountOptionContent account={selectedAccount} />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {accountPlaceholder}
                          </span>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {accountOptions?.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            className="py-2.5"
                          >
                            <AccountOptionContent account={account} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {accountError && <p className="text-xs text-red-500">{accountError}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => setIsAdvancedOpen((prev) => !prev)}
            >
              <Sparkles className="h-4 w-4" />
              Дополнительно
              {isAdvancedOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {isAdvancedOpen && (
              <div className="space-y-4 rounded-2xl border border-dashed border-border/70 bg-muted/5 p-4">
                <Separator />

                {!fixedType && (
                  <div className="space-y-2">
                    <Label htmlFor="create-transaction-type">Тип операции</Label>
                    <Controller
                      name="type"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger
                            id="create-transaction-type"
                            className={cn(
                              typeError && "border-red-400 focus:ring-red-400",
                            )}
                          >
                            {transactionTypeOptions.find(
                              (option) => option.value === field.value,
                            )?.label ?? (
                              <span className="text-muted-foreground">
                                Выберите тип
                              </span>
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {transactionTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {typeError && <p className="text-xs text-red-500">{typeError}</p>}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="create-transaction-emotion">Эмоция</Label>
                    <Controller
                      name="emotion"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={cn(
                              "rounded-full border-dashed text-muted-foreground",
                              !field.value &&
                                "border-primary/30 bg-primary/10 text-foreground",
                            )}
                            onClick={() =>
                              field.onChange(undefined)
                            }
                          >
                            Без эмоции
                          </Button>
                          {transactionEmotionOptions.map((option) => {
                            const isSelected = field.value === option.value;
                            const meta = getTransactionEmotionMeta(option.value);

                            return (
                              <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant="outline"
                                className={cn(
                                  "rounded-full border transition-all",
                                  meta.badgeClassName,
                                  !isSelected && "opacity-80",
                                  isSelected && "ring-2 ring-ring ring-offset-1",
                                )}
                                onClick={() => field.onChange(option.value)}
                              >
                                <span aria-hidden>{option.emoji}</span>
                                <span>{option.shortLabel}</span>
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Необязательно. Помогает потом увидеть импульсивные и
                      нежелательные траты.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-transaction-date">Дата</Label>
                    <Controller
                      name="occurredAt"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="create-transaction-date"
                          type="date"
                          className={cn(
                            dateError && "border-red-400 focus-visible:ring-red-400",
                          )}
                          value={(field.value as string | undefined) ?? ""}
                        />
                      )}
                    />
                    {dateError && <p className="text-xs text-red-500">{dateError}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="create-transaction-note"
                    className="flex items-center gap-2"
                  >
                    <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                    Комментарий
                  </Label>
                  <Controller
                    name="note"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="create-transaction-note"
                        rows={3}
                        maxLength={200}
                        placeholder="Например: кофе перед работой"
                        className={cn(
                          "min-h-[88px] resize-none",
                          noteError && "border-red-400 focus-visible:ring-red-400",
                        )}
                        value={(field.value as string | undefined) ?? ""}
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">Необязательно.</p>
                  {noteError && <p className="text-xs text-red-500">{noteError}</p>}
                </div>
              </div>
            )}
          </div>

          {createTransactionError instanceof Error && (
            <p className="text-sm text-red-500">
              Ошибка сохранения: {createTransactionError.message}
            </p>
          )}

          <Separator />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Отмена
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="sm:min-w-44">
              {isPending
                ? "Сохраняю..."
                : submitLabelByType[effectiveType] ?? "Сохранить"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTransactionForm;
