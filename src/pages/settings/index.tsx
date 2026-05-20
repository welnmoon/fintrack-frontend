import { APP_THEMES, useTheme } from "@/app/providers";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { useLogout } from "@/features/auth-login/api/use-logout";
import LoginForm from "@/features/auth-login/ui/login-form";
import UpdateUserCurrencyForm from "@/features/update-user/ui/update-user-currency";
import UpdateUserForm from "@/features/update-user/ui/update-user";
import { cn } from "@/shared/lib";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import {
  Check,
  Layers3,
  MoonStar,
  Palette,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { HashLoader } from "react-spinners";

const appearanceLabelMap = {
  light: "Light",
  dark: "Dark",
} as const;

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const activeTheme =
    APP_THEMES.find((item) => item.id === theme) ?? APP_THEMES[0];

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetUser();
  const {
    mutate: logoutMutate,
    isPending: logoutIsPending,
    isError: logoutIsError,
    error: logoutError,
  } = useLogout();

  const displayName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <PageContainer>
      <PageHeader
        title="Настройки"
        description="Профиль пользователя и локальные параметры интерфейса."
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-2 rounded-2xl bg-transparent p-0">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="interface">Интерфейс</TabsTrigger>
          <TabsTrigger value="general">Общие</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="max-w-2xl">
            <CardHeader className="border-b border-[#EDEAE4]">
              <CardTitle className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">
                Профиль пользователя
              </CardTitle>
              <CardDescription>
                Личные данные и настройки аккаунта.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {isUserLoading ? (
                <div className="flex items-center justify-center py-8">
                  <HashLoader size={30} color="hsl(var(--foreground))" />
                </div>
              ) : isUserError ? (
                <p className="text-sm text-destructive">
                  Ошибка при загрузке данных пользователя: {" "}
                  {userError instanceof Error
                    ? userError.message
                    : "Неизвестная ошибка"}
                </p>
              ) : !user ? (
                <LoginForm />
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-[#DDD9D1]">
                      <AvatarFallback className="text-lg">
                        {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold">{displayName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Валюта по умолчанию
                    </span>
                    <Badge>{user.defaultCurrency ?? "KZT"}</Badge>
                  </div>

                  <UpdateUserCurrencyForm user={user} />

                  <Separator />

                  <UpdateUserForm user={user} />

                  <Separator />

                  <Button
                    disabled={logoutIsPending}
                    onClick={() => logoutMutate()}
                    variant="destructive"
                  >
                    {logoutIsPending ? "..." : "Выйти"}
                  </Button>

                  {logoutIsError ? (
                    <p className="text-sm text-destructive">
                      {logoutError instanceof Error
                        ? logoutError.message
                        : "Ошибка выхода"}
                    </p>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
            <Card>
              <CardHeader className="space-y-3 border-b border-[#EDEAE4]">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm font-medium">Оформление</span>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>Темы интерфейса</CardTitle>
                    <CardDescription className="mt-1">
                      Переключай оформление без сервера. Новая тема применяется
                      сразу ко всему dashboard.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1.5">
                    {activeTheme.appearance === "dark" ? (
                      <MoonStar className="h-3.5 w-3.5" />
                    ) : (
                      <SunMedium className="h-3.5 w-3.5" />
                    )}
                    {appearanceLabelMap[activeTheme.appearance]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Активная тема
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        {activeTheme.name}
                      </p>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        {activeTheme.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {activeTheme.preview.map((color) => (
                        <span
                          key={color}
                          className="h-10 w-10 rounded-xl border border-black/10 shadow-sm"
                          style={{ backgroundColor: `hsl(${color})` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {APP_THEMES.map((item) => {
                    const isActive = item.id === theme;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTheme(item.id)}
                        className={cn(
                          "rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                          isActive &&
                            "border-primary bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          {isActive ? (
                            <span className="rounded-full bg-primary/12 p-1 text-primary">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : (
                            <Badge variant="outline">
                              {appearanceLabelMap[item.appearance]}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex gap-2">
                            {item.preview.map((color) => (
                              <span
                                key={`${item.id}-${color}`}
                                className="h-12 flex-1 rounded-xl border border-black/10 shadow-sm"
                                style={{ backgroundColor: `hsl(${color})` }}
                              />
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: `hsl(${item.preview[2]})`,
                              }}
                            />
                            <div
                              className="h-2 flex-1 rounded-full"
                              style={{
                                backgroundColor: `hsl(${item.preview[1]})`,
                              }}
                            />
                            <div
                              className="h-2 w-14 rounded-full"
                              style={{
                                backgroundColor: `hsl(${item.preview[0]})`,
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="border-b border-[#EDEAE4]">
                  <CardTitle>Подсказка</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    <p>
                      Тема применяется мгновенно и сохраняется локально в
                      браузере.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    <p>
                      Для аналитики и трейдинга лучше работают `Dark`,
                      `Deep Charcoal` и `Monochrome`.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader className="border-b border-[#EDEAE4]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                <span className="text-sm font-medium">Общее поведение</span>
              </div>
              <CardTitle>Общие параметры</CardTitle>
              <CardDescription>
                Базовые настройки интерфейса без привязки к серверу.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Компактный режим</p>
                  <p className="text-sm text-muted-foreground">
                    Уменьшенные отступы в таблицах и карточках.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
