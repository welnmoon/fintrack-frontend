import { APP_THEMES, useTheme } from "@/app/providers";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { useLogout } from "@/features/auth-login/api/use-logout";
import LoginForm from "@/features/auth-login/ui/login-form";
import UpdateUserForm from "@/features/update-user/ui/update-user";
import { cn } from "@/shared/lib";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
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
  LogOut,
  MoonStar,
  Palette,
  SunMedium,
  User2,
} from "lucide-react";
import { HashLoader } from "react-spinners";

const appearanceLabelMap = {
  light: "Light",
  dark: "Dark",
} as const;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
    {children}
  </p>
);

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

  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <PageContainer>
      <PageHeader
        title="Настройки"
        description="Профиль пользователя и параметры интерфейса."
      />

      <Tabs defaultValue="profile">
        <TabsList className="flex h-auto w-full flex-wrap gap-1.5 rounded-xl border bg-muted/20 p-1.5 sm:w-auto sm:inline-flex">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <User2 className="h-3.5 w-3.5" />
            Профиль
          </TabsTrigger>
          <TabsTrigger
            value="interface"
            className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Palette className="h-3.5 w-3.5" />
            Интерфейс
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Layers3 className="h-3.5 w-3.5" />
            Общие
          </TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile" className="mt-6 max-w-2xl space-y-8">
          {isUserLoading ? (
            <div className="flex items-center justify-center py-16">
              <HashLoader size={28} color="hsl(var(--foreground))" />
            </div>
          ) : isUserError ? (
            <p className="text-sm text-destructive">
              Ошибка загрузки:{" "}
              {userError instanceof Error
                ? userError.message
                : "Неизвестная ошибка"}
            </p>
          ) : !user ? (
            <LoginForm />
          ) : (
            <>
              {/* User card */}
              <div className="flex items-center gap-4 rounded-2xl border bg-card px-5 py-4">
                <Avatar className="h-14 w-14 shrink-0 border border-border/60 text-lg">
                  <AvatarFallback className="bg-muted text-base font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {displayName || "Без имени"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {user.defaultCurrency ?? "KZT"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Edit form */}
              <div>
                <SectionLabel>Редактировать профиль</SectionLabel>
                <UpdateUserForm user={user} />
              </div>

              <Separator />

              {/* Danger zone */}
              <div>
                <SectionLabel>Действия</SectionLabel>
                <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Выйти из аккаунта</p>
                    <p className="text-xs text-muted-foreground">
                      Сессия будет завершена на этом устройстве.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={logoutIsPending}
                    onClick={() => logoutMutate()}
                    className="shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {logoutIsPending ? "Выхожу..." : "Выйти"}
                  </Button>
                </div>
                {logoutIsError && (
                  <p className="mt-2 text-sm text-destructive">
                    {logoutError instanceof Error
                      ? logoutError.message
                      : "Ошибка выхода"}
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Interface ── */}
        <TabsContent value="interface" className="mt-6 space-y-6">
          {/* Active theme banner */}
          <div className="flex items-center justify-between rounded-2xl border bg-card px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Активная тема
              </p>
              <p className="mt-0.5 font-semibold">{activeTheme.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {activeTheme.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex gap-1.5">
                {activeTheme.preview.map((color) => (
                  <span
                    key={color}
                    className="h-8 w-8 rounded-lg border border-black/10 shadow-sm"
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                ))}
              </div>
              <Badge
                variant="secondary"
                className="ml-3 gap-1.5"
              >
                {activeTheme.appearance === "dark" ? (
                  <MoonStar className="h-3 w-3" />
                ) : (
                  <SunMedium className="h-3 w-3" />
                )}
                {appearanceLabelMap[activeTheme.appearance]}
              </Badge>
            </div>
          </div>

          {/* Theme grid */}
          <div>
            <SectionLabel>Выбрать тему</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {APP_THEMES.map((item) => {
                const isActive = item.id === theme;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={cn(
                      "group rounded-2xl border bg-card p-4 text-left transition-all",
                      "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                      isActive &&
                        "border-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.25)] bg-primary/[0.04]",
                    )}
                  >
                    {/* Color swatches */}
                    <div className="mb-3 flex gap-1.5">
                      {item.preview.map((color) => (
                        <span
                          key={`${item.id}-${color}`}
                          className="h-10 flex-1 rounded-lg border border-black/10 shadow-sm"
                          style={{ backgroundColor: `hsl(${color})` }}
                        />
                      ))}
                    </div>

                    {/* Mini bar */}
                    <div className="mb-3 flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: `hsl(${item.preview[2]})` }}
                      />
                      <div
                        className="h-1.5 flex-1 rounded-full"
                        style={{ backgroundColor: `hsl(${item.preview[1]})` }}
                      />
                      <div
                        className="h-1.5 w-10 rounded-full"
                        style={{ backgroundColor: `hsl(${item.preview[0]})` }}
                      />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {isActive ? (
                        <span className="mt-0.5 shrink-0 rounded-full bg-primary/12 p-1 text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <Badge
                          variant="outline"
                          className="mt-0.5 shrink-0 text-[10px]"
                        >
                          {appearanceLabelMap[item.appearance]}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── General ── */}
        <TabsContent value="general" className="mt-6 max-w-2xl">
          <SectionLabel>Общее поведение</SectionLabel>
          <div className="divide-y divide-border/60 rounded-2xl border bg-card">
            <SettingRow
              title="Компактный режим"
              description="Уменьшенные отступы в таблицах и карточках."
            >
              <Switch />
            </SettingRow>

            <SettingRow
              title="Анимации интерфейса"
              description="Плавные переходы при смене разделов."
            >
              <Switch defaultChecked />
            </SettingRow>

            <SettingRow
              title="Звуковые уведомления"
              description="Воспроизводить звук при добавлении транзакции."
            >
              <Switch />
            </SettingRow>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
