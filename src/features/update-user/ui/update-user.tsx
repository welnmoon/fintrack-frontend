import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { User } from "@/entities/user/model/types.api";
import { Button } from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { useUpdateUser } from "../api/use-update-user";
import {
  updateUserSchema,
  type UpdateUserSchemaType,
} from "../model/update-user-schema";

type Props = {
  user: User;
};

const getDefaultValues = (user: User): UpdateUserSchemaType => ({
  email: user.email,
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
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
  }, [form, user]);

  const onSubmit = (values: UpdateUserSchemaType) => {
    if (isPending) return;

    mutate({
      email: values.email?.trim() || undefined,
      firstName: values.firstName?.trim() || undefined,
      lastName: values.lastName?.trim() || undefined,
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
