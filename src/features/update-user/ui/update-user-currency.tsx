import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
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

const NO_DEFAULT_ACCOUNT = "__none__";

const updateUserCurrencySchema = updateUserSchema.pick({
  defaultCurrency: true,
  defaultAccountId: true,
});

type UpdateUserCurrencySchemaType = Pick<UpdateUserSchemaType, "defaultCurrency" | "defaultAccountId">;

const currencyOptions = CURRENCY_CODES.map((currency) => ({
  value: currency,
  label: currency,
}));

const getDefaultValues = (user: User): UpdateUserCurrencySchemaType => ({
  defaultCurrency: user.defaultCurrency ?? "KZT",
  defaultAccountId: user.defaultAccountId ?? "",
});

const UpdateUserCurrencyForm = ({ user }: Props) => {
  const { data: accountOptionsData } = useGetAccountOptions();
  const form = useForm<UpdateUserCurrencySchemaType>({
    defaultValues: getDefaultValues(user),
    resolver: zodResolver(updateUserCurrencySchema),
    mode: "onChange",
  });

  const { mutate, isPending, error } = useUpdateUser();

  useEffect(() => {
    form.reset(getDefaultValues(user));
  }, [form, user]);

  const onSubmit = (values: UpdateUserCurrencySchemaType) => {
    if (isPending) return;

    mutate({
      defaultCurrency: values.defaultCurrency,
      defaultAccountId: values.defaultAccountId?.trim()
        ? values.defaultAccountId
        : null,
    });
  };

  const accountOptions = [
    { value: NO_DEFAULT_ACCOUNT, label: "Не выбрано" },
    ...(accountOptionsData ?? []).map((account) => ({
      value: account.id,
      label: `${account.name} (${account.currency})`,
    })),
  ];

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormSelect
        control={form.control}
        name="defaultCurrency"
        label="Валюта по умолчанию"
        id="profile-default-currency"
        options={currencyOptions}
      />

      <FormSelect
        control={form.control}
        name="defaultAccountId"
        label="Счёт по умолчанию"
        id="profile-default-account"
        options={accountOptions}
        valueFromField={(value) =>
          typeof value === "string" && value.length > 0
            ? value
            : NO_DEFAULT_ACCOUNT
        }
        fieldFromValue={(value) =>
          value === NO_DEFAULT_ACCOUNT ? "" : value
        }
      />

      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? "Сохраняю..." : "Сохранить общие"}
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
