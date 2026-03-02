import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { TransactionType } from "@/entities/transaction";
import { Button, FormSelect } from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
import { useGetCategories } from "@/entities/category/api/use-get-categories";
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

const transactionTypeOptions: Array<{ value: TransactionType; label: string }> =
  [
    { value: "INCOME", label: "Доход" },
    { value: "EXPENSE", label: "Расход" },
    { value: "ADJUSTMENT", label: "Корректировка" },
  ];

const getDefaultOccurredAtValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
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
});

const CreateTransactionForm = ({
  type: fixedType,
  onSuccess,
  onCancel,
  onSubmitStart,
}: CreateTransactionFormProps) => {
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
  const filteredCategories =
    categories?.filter((category) => {
      if (effectiveType === "INCOME" || effectiveType === "EXPENSE") {
        return category.type === effectiveType;
      }
      return true;
    }) ?? [];

  const onSubmit = (values: CreateTransactionType) => {
    if (isPending) return;
    onSubmitStart?.();

    createTransaction(
      {
        ...values,
        note: values.note?.trim() || undefined,
        occurredAt: new Date(values.occurredAt).toISOString(),
      },
      {
        onSuccess: () => {
          form.reset(getDefaultValues(fixedType));
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form className="mt-5 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormSelect
          control={form.control}
          name="type"
          label="Тип операции"
          id="create-transaction-type"
          placeholder="Выберите тип"
          disabled={Boolean(fixedType)}
          options={transactionTypeOptions}
        />

        <FormInput
          control={form.control}
          name="amount"
          label="Сумма"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormSelect
          control={form.control}
          name="accountId"
          label="Счет"
          id="create-transaction-account"
          placeholder={isAccountsLoading ? "Загрузка..." : "Выберите счет"}
          disabled={isAccountsLoading || !accountOptions}
          options={
            accountOptions?.map((account) => ({
              value: account.id,
              label: (
                <span className="flex w-full items-center justify-between gap-3">
                  <span>
                    {account.name} ({account.type})
                  </span>
                  <span className="text-muted-foreground">
                    {account.currency}
                  </span>
                </span>
              ),
            })) ?? []
          }
        />

        <FormSelect
          control={form.control}
          name="categoryId"
          label="Категория"
          id="create-transaction-category"
          placeholder={
            isCategoriesLoading ? "Загрузка..." : "Выберите категорию"
          }
          disabled={isCategoriesLoading || filteredCategories.length === 0}
          options={[
            { value: NO_CATEGORY_VALUE, label: "Без категории" },
            ...filteredCategories.map((category) => ({
              value: category.id,
              label: category.name,
            })),
          ]}
          valueFromField={(value) =>
            (value as string | undefined) ?? NO_CATEGORY_VALUE
          }
          fieldFromValue={(value) =>
            value === NO_CATEGORY_VALUE ? undefined : value
          }
        />
      </div>

      <FormInput
        control={form.control}
        name="occurredAt"
        label="Дата операции"
        type="datetime-local"
      />

      <FormInput
        control={form.control}
        name="note"
        label="Комментарий"
        placeholder="Описание операции"
        textarea
        rows={3}
        maxLength={200}
      />

      {createTransactionError instanceof Error && (
        <p className="text-sm text-red-500">
          Ошибка сохранения: {createTransactionError.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Сохраняю..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
};

export default CreateTransactionForm;
