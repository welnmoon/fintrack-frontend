import { APP_THEMES, useTheme } from "@/app/providers";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { useLogout } from "@/features/auth-login/api/use-logout";
import LoginForm from "@/features/auth-login/ui/login-form";
import UpdateUserCurrencyForm from "@/features/update-user/ui/update-user-currency";
import UpdateUserForm from "@/features/update-user/ui/update-user";
import { cn } from "@/shared/lib";
import { Avatar, AvatarFallback, Switch } from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import { Check, LogOut, MoonStar, SunMedium } from "lucide-react";
import { useState } from "react";
import { HashLoader } from "react-spinners";

type TabId = "profile" | "interface" | "general";

const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Профиль" },
  { id: "interface", label: "Интерфейс" },
  { id: "general", label: "Общие" },
];

/* ── Mini section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </p>
  );
}

/* ── Toggle row ── */
function SettingRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border/50 px-6 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold leading-snug text-foreground">
          {title}
        </p>
        <p className="mt-[3px] text-[13px] text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch defaultChecked={defaultChecked} className="shrink-0" />
    </div>
  );
}

/* ── Theme preview card ── */
function ThemeCard({
  item,
  isActive,
  onSelect,
}: {
  item: (typeof APP_THEMES)[number];
  isActive: boolean;
  onSelect: () => void;
}) {
  const [bg, surface, accent] = item.preview;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "overflow-hidden rounded-[14px] border text-left transition-all duration-150",
        "hover:-translate-y-[2px] hover:shadow-md",
        isActive
          ? "border-foreground shadow-[0_0_0_1px_hsl(var(--foreground)/0.12)]"
          : "border-border hover:border-muted-foreground/40",
      )}
    >
      {/* Mini app chrome mockup */}
      <div
        className="relative h-[80px] overflow-hidden"
        style={{ background: `hsl(${bg})` }}
      >
        {/* Sidebar strip */}
        <div
          className="absolute inset-y-0 left-0 w-6"
          style={{ background: `hsl(${surface})` }}
        />
        {/* Sidebar nav items */}
        {[10, 22, 34, 46].map((top) => (
          <div
            key={top}
            className="absolute left-[3px] rounded-[2px]"
            style={{
              top,
              width: 18,
              height: 4,
              background: `hsl(${accent} / 0.5)`,
            }}
          />
        ))}
        {/* Top bar */}
        <div
          className="absolute right-0 top-0 h-4"
          style={{
            left: 24,
            background: `hsl(${surface})`,
            borderBottom: `1px solid hsl(${accent} / 0.1)`,
          }}
        />
        {/* Content cards */}
        <div
          className="absolute rounded-[3px]"
          style={{
            top: 22,
            left: 32,
            right: 6,
            height: 20,
            background: `hsl(${surface})`,
            opacity: 0.75,
          }}
        />
        <div
          className="absolute rounded-[3px]"
          style={{
            top: 48,
            left: 32,
            right: 16,
            height: 12,
            background: `hsl(${surface})`,
            opacity: 0.4,
          }}
        />
        {/* Accent indicator */}
        <div
          className="absolute right-2.5 top-[22px] h-2 w-2 rounded-full"
          style={{ background: `hsl(${accent})` }}
        />
        {/* Selected check */}
        {isActive && (
          <div
            className="absolute bottom-2 right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full"
            style={{ background: `hsl(${accent})` }}
          >
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-start justify-between gap-2 bg-card px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-foreground">
            {item.name}
          </p>
          <p className="mt-[1px] line-clamp-1 text-[10px] text-muted-foreground">
            {item.description}
          </p>
        </div>
        <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/30 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
          {item.appearance === "dark" ? (
            <MoonStar className="h-2.5 w-2.5" />
          ) : (
            <SunMedium className="h-2.5 w-2.5" />
          )}
          {item.appearance === "dark" ? "Dark" : "Light"}
        </span>
      </div>
    </button>
  );
}

/* ── Page ── */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { theme, setTheme } = useTheme();
  const activeTheme = APP_THEMES.find((t) => t.id === theme) ?? APP_THEMES[0];

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
  const initials =
    (displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <PageContainer>
      <PageHeader
        title="Настройки"
        description="Профиль пользователя и параметры интерфейса."
      />

      {/* ── Tab pills (matching style of accounts/dashboard buttons) ── */}
      <div className="flex gap-1 rounded-[10px] border border-border bg-muted/20 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-[7px] px-4 py-1.5 text-[13px] font-medium transition-all duration-150",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          PROFILE
         ══════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-5">
          {isUserLoading ? (
            <div className="flex items-center justify-center py-16">
              <HashLoader size={28} color="hsl(var(--foreground))" />
            </div>
          ) : isUserError ? (
            <p className="text-[13px] text-destructive">
              Ошибка:{" "}
              {userError instanceof Error
                ? userError.message
                : "Неизвестная ошибка"}
            </p>
          ) : !user ? (
            <LoginForm />
          ) : (
            <>
              {/* User info + edit form in one card */}
              <div className="overflow-hidden rounded-[20px] border border-border bg-card">
                {/* Header row */}
                <div className="flex items-center gap-4 border-b border-border px-6 py-5">
                  <Avatar className="h-12 w-12 shrink-0 border border-border">
                    <AvatarFallback className="bg-muted text-[15px] font-semibold text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-foreground">
                      {displayName || "—"}
                    </p>
                    <p className="mt-[2px] truncate text-[13px] text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                    {user.defaultCurrency ?? "KZT"}
                  </span>
                </div>

                {/* Edit form */}
                <div className="px-6 py-5">
                  <SectionLabel>Редактировать профиль</SectionLabel>
                  <UpdateUserForm user={user} />
                </div>
              </div>

              {/* Danger zone */}
              <div className="overflow-hidden rounded-[20px] border border-destructive/20 bg-card">
                <div className="border-b border-destructive/15 px-6 py-3">
                  <SectionLabel>Действия</SectionLabel>
                </div>
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">
                      Выйти из аккаунта
                    </p>
                    <p className="mt-[3px] text-[13px] text-muted-foreground">
                      Сессия будет завершена на этом устройстве.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={logoutIsPending}
                    onClick={() => logoutMutate()}
                    className="flex shrink-0 items-center gap-1.5 rounded-[9px] border border-destructive/35 px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {logoutIsPending ? "Выхожу..." : "Выйти"}
                  </button>
                </div>
                {logoutIsError && (
                  <p className="border-t border-destructive/15 px-6 py-3 text-[13px] text-destructive">
                    {logoutError instanceof Error
                      ? logoutError.message
                      : "Ошибка выхода"}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          INTERFACE
         ══════════════════════════════ */}
      {activeTab === "interface" && (
        <div className="space-y-5">
          {/* Active theme summary */}
          <div className="overflow-hidden rounded-[20px] border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Активная тема
              </p>
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {activeTheme.appearance === "dark" ? (
                  <MoonStar className="h-3 w-3" />
                ) : (
                  <SunMedium className="h-3 w-3" />
                )}
                {activeTheme.appearance === "dark" ? "Dark" : "Light"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-5 px-6 py-5">
              {/* Color swatches */}
              <div className="flex gap-2">
                {activeTheme.preview.map((color, i) => (
                  <span
                    key={i}
                    className="h-10 w-10 rounded-[10px] border border-black/10 shadow-sm"
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                ))}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-foreground">
                  {activeTheme.name}
                </p>
                <p className="mt-[2px] text-[13px] text-muted-foreground">
                  {activeTheme.description}
                </p>
              </div>
            </div>
          </div>

          {/* Theme grid */}
          <div>
            <SectionLabel>Выбрать тему</SectionLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {APP_THEMES.map((item) => (
                <ThemeCard
                  key={item.id}
                  item={item}
                  isActive={item.id === theme}
                  onSelect={() => setTheme(item.id)}
                />
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Тема применяется мгновенно и сохраняется в браузере.
              Изменения отображаются в шапке, боковой панели и элементах
              интерфейса, использующих системные цвета.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          GENERAL
         ══════════════════════════════ */}
      {activeTab === "general" && (
        <div className="max-w-2xl">
          {isUserLoading ? (
            <div className="flex items-center justify-center py-10">
              <HashLoader size={28} color="hsl(var(--foreground))" />
            </div>
          ) : isUserError ? (
            <p className="mb-4 text-[13px] text-destructive">
              Ошибка:{" "}
              {userError instanceof Error
                ? userError.message
                : "Неизвестная ошибка"}
            </p>
          ) : user ? (
            <div className="mb-5 overflow-hidden rounded-[20px] border border-border bg-card px-6 py-5">
              <SectionLabel>По умолчанию</SectionLabel>
              <UpdateUserCurrencyForm user={user} />
            </div>
          ) : null}

          <SectionLabel>Поведение интерфейса</SectionLabel>
          <div className="overflow-hidden rounded-[20px] border border-border bg-card">
            <SettingRow
              title="Компактный режим"
              description="Уменьшенные отступы в таблицах и карточках."
            />
            <SettingRow
              title="Анимации"
              description="Плавные переходы при смене разделов и открытии модалок."
              defaultChecked
            />
            <SettingRow
              title="Звуковые уведомления"
              description="Короткий звук при успешном добавлении транзакции."
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
