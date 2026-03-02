import { useGetUser } from "@/entities/user/api/use-get-user";
import { useLogout } from "@/features/auth-login/api/use-logout";
import LoginForm from "@/features/auth-login/ui/login-form";
import UpdateUserCurrencyForm from "@/features/update-user/ui/update-user-currency";
import UpdateUserForm from "@/features/update-user/ui/update-user";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

export function ProfilePage() {
  const { data, isLoading, isError, error } = useGetUser();
  const {
    mutate: logoutMutate,
    isPending: logoutIsPending,
    isError: logoutIsError,
    error: logoutError,
  } = useLogout();

  const logoutHandle = () => {
    logoutMutate();
  };

  if (isError) {
    console.error("Error fetching user data:", error);
    return (
      <p>
        Ошибка при загрузке данных пользователя:{" "}
        {error instanceof Error ? error.message : "Неизвестная ошибка"}
      </p>
    );
  }

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  if (!data) {
    return <LoginForm />;
  }

  const displayName = [data?.firstName, data?.lastName]
    .filter(Boolean)
    .join(" ");

  const displayEmail = data?.email;

  return (
    <PageContainer>
      <PageHeader
        title="Профиль"
        description="Профиль пользователя и проверка серверных данных."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border">
              <AvatarFallback className="text-lg">
                {displayName ? displayName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Валюта по умолчанию
            </span>
            <Badge>{data.defaultCurrency ?? "KZT"}</Badge>
          </div>
          <UpdateUserCurrencyForm user={data} />
          <Separator />
          <UpdateUserForm user={data} />
          <Separator />
          <Button
            disabled={logoutIsPending}
            onClick={() => logoutHandle()}
            variant={"destructive"}
          >
            {logoutIsPending ? "..." : "Выйти"}
          </Button>
          {logoutIsError && JSON.stringify(logoutError)}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
