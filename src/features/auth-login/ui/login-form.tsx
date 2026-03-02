import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginSchemaType } from "../model/schema";
import { useLogin } from "../api/use-login";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/shared/config";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { Button, Skeleton } from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";

const LoginForm = () => {
  const form = useForm<LoginSchemaType>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
  const { data: userData, isLoading: isGetUserLoading } = useGetUser();
  const { mutate, isPending, isSuccess, error } = useLogin();

  if (isGetUserLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (userData) {
    return <Navigate to={ROUTES.app} />;
  }

  const onSubmit = (values: LoginSchemaType) => {
    if (isPending) return;
    mutate(values);
  };

  if (isSuccess) {
    return <Navigate to={ROUTES.app} />;
  }

  const isBusy = isPending || isGetUserLoading;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
        placeholder="Введите пароль"
        autoComplete="current-password"
        disabled={isBusy}
      />

      <Button type="submit" disabled={isBusy} className="w-full">
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Выполняется вход...
          </span>
        ) : (
          "Войти"
        )}
      </Button>

      {error instanceof Error && (
        <p className="text-sm text-red-500">Ошибка входа: {error.message}</p>
      )}
    </form>
  );
};

export default LoginForm;
