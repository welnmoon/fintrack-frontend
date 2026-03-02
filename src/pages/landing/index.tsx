import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  Target,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import ColourfulText from "@/shared/ui/text/colourful-text";
import { APP_NAME, APP_TAGLINE } from "@/shared/const";
import { ROUTES } from "@/shared/config";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";

const kpiTape = [
  { label: "Счета", value: "12" },
  { label: "Операций / мес", value: "1,248" },
  { label: "Точность учета", value: "99.7%" },
  { label: "Средний чек", value: "$128.40" },
];

const moduleRows = [
  {
    module: "Журнал операций",
    outcome: "Учёт доходов, расходов и переводов в едином реестре транзакций",
    metric: "Фиксация операций в режиме реального времени ",
  },
  {
    module: "Категоризация операций",
    outcome:
      "Структурирование финансовых потоков по пользовательским категориям",
    metric: "Гибкая система классификации",
  },
  {
    module: "Курсы валют",
    outcome:
      "Отображение динамики валют и криптоактивов в интерактивных графиках",
    metric: "Live-обновления через SSE",
  },
  {
    module: "Переводы между счетами",
    outcome:
      "Атомарное перемещение средств с сохранением консистентности баланса",
    metric: "Транзакционная обработка операций",
  },
];

const rolloutSteps = [
  {
    title: "Сконфигурируйте контур учета",
    description:
      "Добавьте счета и категории под вашу фактическую структуру финансов.",
  },
  {
    title: "Перенесите операционный поток",
    description:
      "Фиксируйте операции в момент события и поддерживайте чистый реестр.",
  },
  {
    title: "Примите решения на данных",
    description:
      "Опирайтесь на динамику доходов, расходов и остатка, а не на интуицию.",
  },
];

const reliabilityPoints = [
  "Типизированная модель данных",
  "Готовность к backend API",
  "Масштабируемая архитектура модулей",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
          </div>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#scope" className="hover:text-foreground">
              Обзор
            </a>
            <a href="#modules" className="hover:text-foreground">
              Модули
            </a>
            <a href="#rollout" className="hover:text-foreground">
              Внедрение
            </a>
          </div>
          <Button asChild size="sm">
            <Link to={ROUTES.app}>Войти в систему</Link>
          </Button>
        </div>
      </header>

      <main className="pb-12">
        <section id="scope" className="border-b py-12 lg:py-16">
          <div className="container grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Консоль финансовых операции
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Управленческий контур личных финансов на базе{" "}
                <ColourfulText
                  className="inline-block font-semibold"
                  text={APP_NAME}
                  colors={[
                    "rgb(15, 23, 42)",
                    "rgb(30, 64, 175)",
                    "rgb(20, 83, 45)",
                    "rgb(15, 23, 42)",
                  ]}
                />
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                {APP_TAGLINE}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to={ROUTES.app}>
                    Открыть рабочее пространство
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#modules">Изучить модули</a>
                </Button>
              </div>
            </div>

            <Card className="border bg-card shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    Совокупный баланс
                  </p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">
                    $19,341.20
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Доходы (30д)</span>
                    <span className="font-semibold tabular-nums">$3,520</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Расходы (30д)</span>
                    <span className="font-semibold tabular-nums">$1,860</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Net Flow</span>
                    <span className="font-semibold tabular-nums text-accent">
                      +$1,660
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {reliabilityPoints.map((point) => (
                    <div key={point} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                      <span className="text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-8">
          <div className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpiTape.map((item) => (
              <Card key={item.label} className="shadow-none">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="trading"
          className="py-12 container lg:py-16 flex flex-col  items-center"
        >
          <div className=" flex justify-center pb-10">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl text-center">
              Актуальные курсы валют в реальном времени
            </h1>
          </div>
          <img
            className="rounded-md w-[90%] md:w-2/3 "
            src="src/shared/assets/trading-charts.png"
          />
        </section>

        <section id="modules" className="border-y bg-muted/25 py-12">
          <div className="container space-y-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                Архитектура продукта
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Функциональные модули
              </h2>
              <p className="mt-2 text-muted-foreground">
                Не набор карточек, а операционная система финансового учета с
                четкой ролью каждого блока.
              </p>
            </div>

            <Card className="shadow-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Модуль</TableHead>
                    <TableHead>Практический эффект</TableHead>
                    <TableHead className="text-right">
                      Операционный KPI
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moduleRows.map((row) => (
                    <TableRow key={row.module}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-2">
                          <Layers3 className="h-4 w-4 text-primary" />
                          {row.module}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.outcome}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {row.metric}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>

        <section id="rollout" className="py-12">
          <div className="container grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                План внедрения
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Запуск без лишнего overhead
              </h2>
              <p className="text-muted-foreground">
                Пошаговый сценарий, который переводит учет из хаотичного режима
                в управляемый процесс.
              </p>
              <Button asChild>
                <Link to={ROUTES.app}>
                  Начать работу
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {rolloutSteps.map((step, index) => (
                <Card key={step.title} className="shadow-none">
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-4">
          <div className="container">
            <Card className="border bg-slate-950 text-white shadow-none">
              <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                    Доступ к рабочему контуру
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Перейдите к управлению финансами
                  </h3>
                  <p className="text-sm text-white/70">
                    Финансовая дисциплина начинается с прозрачной и регулярной
                    фиксации данных.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="secondary">
                    <Link to={ROUTES.app}>
                      Открыть приложение
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/25 bg-transparent text-white hover:bg-white/10"
                  >
                    <a href="#scope">Наверх</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-8">
        <div className="container space-y-4">
          <Separator />
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} {APP_NAME}. Structured UI for finance
            operations.
          </p>
        </div>
      </footer>
    </div>
  );
}
