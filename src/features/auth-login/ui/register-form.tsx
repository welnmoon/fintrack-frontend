import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/shared/config";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { Button, Skeleton } from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { registerSchema, type RegisterSchemaType } from "../model/schema";
import { useRegister } from "../api/use-register";

const RegisterForm = () => {
  const form = useForm<RegisterSchemaType>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const { data: userData, isLoading: isGetUserLoading } = useGetUser();
  const { mutate, isPending, isSuccess, error } = useRegister();

  if (isGetUserLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (userData) {
    return <Navigate to={ROUTES.app} />;
  }

  const onSubmit = (values: RegisterSchemaType) => {
    if (isPending) return;
    mutate(values);
  };

  if (isSuccess) {
    return <Navigate to={ROUTES.app} />;
  }

  const isBusy = isPending || isGetUserLoading;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          control={form.control}
          name="firstName"
          label="Имя"
          type="text"
          placeholder="Иван"
          autoComplete="given-name"
          disabled={isBusy}
        />

        <FormInput
          control={form.control}
          name="lastName"
          label="Фамилия"
          type="text"
          placeholder="Иванов"
          autoComplete="family-name"
          disabled={isBusy}
        />
      </div>

      <FormInput
        control={form.control}
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isBusy}
      />

      <FormInput
        control={form.control}
        name="password"
        label="Пароль"
        type="password"
        placeholder="Минимум 6 символов"
        autoComplete="new-password"
        disabled={isBusy}
      />

      <Button type="submit" disabled={isBusy} className="w-full">
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Создание аккаунта...
          </span>
        ) : (
          "Зарегистрироваться"
        )}
      </Button>

      {error instanceof Error && (
        <p className="text-sm text-red-500">
          Ошибка регистрации: {error.message}
        </p>
      )}
    </form>
  );
};

export default RegisterForm;
