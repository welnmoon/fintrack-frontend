import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { User } from "@/entities/user/model/types.api";
import { CURRENCY_CODES } from "@/shared/model/currency/schema";
import { Button, FormSelect } from "@/shared/ui";
import { useUpdateUser } from "../api/use-update-user";
import {
  updateUserSchema,
  type UpdateUserSchemaType,
} from "../model/update-user-schema";

type Props = {
  user: User;
};

const updateUserCurrencySchema = updateUserSchema.pick({
  defaultCurrency: true,
});

type UpdateUserCurrencySchemaType = Pick<
  UpdateUserSchemaType,
  "defaultCurrency"
>;

const currencyOptions = CURRENCY_CODES.map((currency) => ({
  value: currency,
  label: currency,
}));

const getDefaultValues = (user: User): UpdateUserCurrencySchemaType => ({
  defaultCurrency: user.defaultCurrency ?? "KZT",
});

const UpdateUserCurrencyForm = ({ user }: Props) => {
  const form = useForm<UpdateUserCurrencySchemaType>({
    defaultValues: getDefaultValues(user),
    resolver: zodResolver(updateUserCurrencySchema),
    mode: "onChange",
  });

  const { mutate, isPending, error } = useUpdateUser();

  useEffect(() => {
    form.reset(getDefaultValues(user));
  }, [form, user.defaultCurrency]);

  const onSubmit = (values: UpdateUserCurrencySchemaType) => {
    if (isPending) return;

    mutate({
      defaultCurrency: values.defaultCurrency,
    });
  };

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_auto]"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormSelect
        control={form.control}
        name="defaultCurrency"
        label="Валюта по умолчанию"
        id="profile-default-currency"
        options={currencyOptions}
      />

      <div className="md:self-end">
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? "Сохраняю..." : "Сохранить валюту"}
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

export default UpdateUserCurrencyForm;
