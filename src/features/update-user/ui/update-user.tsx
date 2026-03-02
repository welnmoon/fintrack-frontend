import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { User } from "@/entities/user/model/types.api";
import { CURRENCY_CODES } from "@/shared/model/currency/schema";
import { Button, FormSelect } from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { useUpdateUser } from "../api/use-update-user";
import {
  updateUserSchema,
  type UpdateUserSchemaType,
} from "../model/update-user-schema";

type Props = {
  user: User;
};

const currencyOptions = CURRENCY_CODES.map((currency) => ({
  value: currency,
  label: currency,
}));

const getDefaultValues = (user: User): UpdateUserSchemaType => ({
  email: user.email,
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  defaultCurrency: user.defaultCurrency ?? "KZT",
});

const UpdateUserForm = ({ user }: Props) => {
  const form = useForm<UpdateUserSchemaType>({
    defaultValues: getDefaultValues(user),
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
  });

  const { mutate, isPending, error } = useUpdateUser();

  useEffect(() => {
    form.reset(getDefaultValues(user));
  }, [form, user.email, user.firstName, user.lastName, user.defaultCurrency]);

  const onSubmit = (values: UpdateUserSchemaType) => {
    if (isPending) return;

    mutate({
      email: values.email?.trim() || undefined,
      firstName: values.firstName?.trim() || undefined,
      lastName: values.lastName?.trim() || undefined,
      defaultCurrency: values.defaultCurrency,
    });
  };

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormInput
        control={form.control}
        name="firstName"
        label="Имя"
        placeholder="Введите имя"
      />

      <FormInput
        control={form.control}
        name="lastName"
        label="Фамилия"
        placeholder="Введите фамилию"
      />

      <FormInput
        control={form.control}
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        containerClassName="md:col-span-2"
      />

      <FormSelect
        control={form.control}
        name="defaultCurrency"
        label="Валюта по умолчанию"
        id="update-user-default-currency"
        options={currencyOptions}
      />

      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Сохраняю..." : "Сохранить профиль"}
        </Button>
      </div>

      {error instanceof Error && (
        <p className="text-sm text-red-500 md:col-span-2">
          Ошибка обновления: {error.message}
        </p>
      )}
    </form>
  );
};

export default UpdateUserForm;
