import { useLogin } from "@/entities/auth/api/use-login";
import { mockUser } from "@/entities/user";
import { useGetUser } from "@/entities/user/api/use-get-user";
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
  const login = useLogin();
  const { data, isLoading, isError, error, refetch } = useGetUser();
  const displayName =
    [data?.firstName, data?.lastName].filter(Boolean).join(" ") ||
    mockUser.fullName;
  const displayEmail = data?.email ?? mockUser.email;

  return (
    <PageContainer>
      <PageHeader
        title="Профиль"
        description="Профиль пользователя и проверка серверных данных."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border">
              <AvatarFallback className="text-lg">
                {mockUser.initials}
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
            <Badge>{mockUser.defaultCurrency}</Badge>
          </div>
          <Button
            onClick={() =>
              login.mutate(
                { email: "new@gmail.com", password: "4321" },
                { onSuccess: () => refetch() },
              )
            }
          >
            Login
          </Button>
          {login.isPending && (
            <p className="text-sm text-muted-foreground">Выполняется вход...</p>
          )}
          {login.isSuccess && (
            <p className="text-sm text-green-500">Вход выполнен успешно!</p>
          )}
          {login.isError && (
            <p className="text-sm text-red-500">
              Ошибка входа:{" "}
              {login.error instanceof Error
                ? login.error.message
                : "Неизвестная ошибка"}
            </p>
          )}
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Загрузка профиля...
            </p>
          )}
          {isError && (
            <p className="text-sm text-red-500">
              Ошибка профиля:{" "}
              {error instanceof Error ? error.message : "Неизвестная ошибка"}
            </p>
          )}
          <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
            {JSON.stringify({ login: login.data, me: data }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
