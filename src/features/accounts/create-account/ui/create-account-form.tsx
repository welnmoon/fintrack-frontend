import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  DEFAULT_ACCOUNT_BACKGROUND_KEY,
} from "@/entities/account/lib/account-backgrounds";
import { AccountBackgroundPicker } from "@/entities/account/ui/account-background-picker";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { useGetAccounts } from "@/entities/account/api/use-get-accounts";
import { useCreateAccount } from "../api/use-create-accoun";
import {
  createAccountSchema,
  type CreateAccountSchemaType,
} from "../model/schema";

const accountTypeOptions = [
  { value: "CASH", label: "Наличные (CASH)" },
  { value: "BANK", label: "Банк (BANK)" },
] as const;

const currencyOptions = [
  { value: "KZT", label: "KZT" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
] as const;

const MAX_ACCOUNTS_PER_USER = 5;

const CreateAccountForm = () => {
  const { data: accounts } = useGetAccounts();
  const form = useForm<CreateAccountSchemaType>({
    defaultValues: {
      name: "",
      type: "CASH",
      currency: "KZT",
      backgroundKey: DEFAULT_ACCOUNT_BACKGROUND_KEY,
    },
    resolver: zodResolver(createAccountSchema),
    mode: "onChange",
  });

  const { mutate, isPending, error } = useCreateAccount();
  const accountCount = accounts?.length ?? 0;
  const hasReachedLimit = accountCount >= MAX_ACCOUNTS_PER_USER;

  const onSubmit = (values: CreateAccountSchemaType) => {
    if (isPending || hasReachedLimit) return;

    mutate(values, {
      onSuccess: () => {
        form.reset({
          name: "",
          type: values.type,
          currency: values.currency,
          backgroundKey: values.backgroundKey,
        });
      },
    });
  };

  return (
    <form
      className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormInput
        control={form.control}
        name="name"
        label="Название"
        type="text"
        placeholder="Например: Kaspi Gold"
        containerClassName="md:col-span-2"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="account-type">
          Тип
        </label>
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="account-type"
                className={
                  form.formState.errors.type
                    ? "border-red-400 focus:ring-red-400"
                    : undefined
                }
              >
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {accountTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.type?.message && (
          <p className="text-xs text-red-500">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="account-currency">
          Валюта
        </label>
        <Controller
          name="currency"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="account-currency"
                className={
                  form.formState.errors.currency
                    ? "border-red-400 focus:ring-red-400"
                    : undefined
                }
              >
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.currency?.message && (
          <p className="text-xs text-red-500">
            {form.formState.errors.currency.message}
          </p>
        )}
      </div>

      <div className="md:col-span-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Фон карты</label>
          <Controller
            name="backgroundKey"
            control={form.control}
            render={({ field }) => (
              <AccountBackgroundPicker
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="md:col-span-4">
        <Button type="submit" disabled={isPending || hasReachedLimit}>
          {isPending ? "Создаю..." : "Создать счет"}
        </Button>
      </div>

      {hasReachedLimit && (
        <p className="text-sm text-muted-foreground md:col-span-4">
          Достигнут лимит счетов: {MAX_ACCOUNTS_PER_USER}.
        </p>
      )}

      {error instanceof Error && (
        <p className="text-sm text-red-500 md:col-span-4">
          Ошибка создания: {error.message}
        </p>
      )}
    </form>
  );
};

export default CreateAccountForm;
