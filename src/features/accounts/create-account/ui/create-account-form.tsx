import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
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

const CreateAccountForm = () => {
  const form = useForm<CreateAccountSchemaType>({
    defaultValues: {
      name: "",
      type: "CASH",
      currency: "KZT",
    },
    resolver: zodResolver(createAccountSchema),
    mode: "onChange",
  });

  const { mutate, isPending, error } = useCreateAccount();

  const onSubmit = (values: CreateAccountSchemaType) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: () => {
        form.reset({
          name: "",
          type: values.type,
          currency: values.currency,
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Создаю..." : "Создать счет"}
        </Button>
      </div>

      {error instanceof Error && (
        <p className="text-sm text-red-500 md:col-span-4">
          Ошибка создания: {error.message}
        </p>
      )}
    </form>
  );
};

export default CreateAccountForm;
