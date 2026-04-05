import { APP_THEMES, useTheme } from "@/app/providers";
import { cn } from "@/shared/lib";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import {
  BellRing,
  Check,
  Layers3,
  MoonStar,
  Palette,
  PlugZap,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";

const appearanceLabelMap = {
  light: "Light",
  dark: "Dark",
} as const;

const placeholderCards = [
  {
    value: "notifications",
    label: "Уведомления",
    icon: BellRing,
    title: "Уведомления",
    description: "Настройки уведомлений появятся здесь позже.",
  },
  {
    value: "security",
    label: "Безопасность",
    icon: ShieldCheck,
    title: "Безопасность",
    description: "2FA, сессии и управление устройствами будут добавлены позже.",
  },
  {
    value: "integrations",
    label: "Интеграции",
    icon: PlugZap,
    title: "Интеграции",
    description: "Подключения банков, экспорты и синхронизация появятся позже.",
  },
] as const;

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const activeTheme =
    APP_THEMES.find((item) => item.id === theme) ?? APP_THEMES[0];

  return (
    <PageContainer>
      <PageHeader
        title="Настройки"
        description="Локальные настройки интерфейса, сохранённые на этом устройстве."
      />

      <Tabs defaultValue="interface" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-2 rounded-2xl bg-transparent p-0">
          <TabsTrigger value="interface">Интерфейс</TabsTrigger>
          <TabsTrigger value="general">Общие</TabsTrigger>
          {placeholderCards.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="interface" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
            <Card>
              <CardHeader className="space-y-3">
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
              <CardContent className="space-y-6">
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
                <CardHeader>
                  <CardTitle>Подсказка</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
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
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                <span className="text-sm font-medium">Общее поведение</span>
              </div>
              <CardTitle>Общие параметры</CardTitle>
              <CardDescription>
                Базовые настройки интерфейса без привязки к серверу.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

        {placeholderCards.map((item) => {
          const Icon = item.icon;

          return (
            <TabsContent key={item.value} value={item.value}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
                    Раздел пока пустой. Здесь появятся реальные настройки в
                    следующих итерациях.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </PageContainer>
  );
}
