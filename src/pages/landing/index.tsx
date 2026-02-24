import { ArrowRight, BarChart3, CreditCard, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE } from '@/shared/const'
import { ROUTES } from '@/shared/config'
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/shared/ui'

const features = [
  {
    title: 'Полный контроль трат',
    description: 'Собирайте расходы по категориям и быстро находите утечки бюджета.',
    icon: BarChart3,
  },
  {
    title: 'Счета и балансы в одном месте',
    description: 'Карты, наличные и накопления в единой панели управления.',
    icon: CreditCard,
  },
  {
    title: 'Надежная структура данных',
    description: 'Готовый foundation для дальнейшей интеграции с backend.',
    icon: ShieldCheck,
  },
]

const steps = [
  {
    step: '01',
    title: 'Создайте счета и категории',
    description: 'Подготовьте основу: где храните деньги и по каким статьям учитываете движение.',
  },
  {
    step: '02',
    title: 'Фиксируйте операции',
    description: 'Добавляйте доходы, расходы и переводы между счетами.',
  },
  {
    step: '03',
    title: 'Анализируйте динамику',
    description: 'Смотрите ключевые показатели и принимайте решения на цифрах.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
          <Button asChild variant="outline" className="rounded-full">
            <Link to={ROUTES.app}>Перейти в приложение</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b py-20 sm:py-24">
          <div className="container grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Finance Dashboard
              </p>
              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {APP_NAME} - ваш персональный центр управления финансами
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{APP_TAGLINE}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <Link to={ROUTES.app}>
                    Открыть приложение
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <a href="#details">Подробнее</a>
                </Button>
              </div>
            </div>

            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Dashboard preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-white/80">Баланс</p>
                  <p className="mt-1 text-3xl font-semibold">$19,341.20</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                    <p className="text-xs text-white/70">Доходы</p>
                    <p className="mt-1 text-lg font-semibold">$3,520</p>
                  </div>
                  <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                    <p className="text-xs text-white/70">Расходы</p>
                    <p className="mt-1 text-lg font-semibold">$1,860</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="details" className="py-16">
          <div className="container space-y-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Возможности</h2>
              <p className="mt-2 text-muted-foreground">Каркас построен как база для дипломного проекта и будущих интеграций.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title}>
                    <CardHeader>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-y bg-card/50 py-16">
          <div className="container">
            <h2 className="mb-8 text-3xl font-semibold tracking-tight">Как это работает</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((item) => (
                <Card key={item.step} className="border-dashed">
                  <CardHeader>
                    <p className="text-sm font-semibold text-accent">Шаг {item.step}</p>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8">
        <div className="container space-y-4">
          <Separator />
          <p className="text-sm text-muted-foreground">{new Date().getFullYear()} Fintrack. UI scaffold for diploma project.</p>
        </div>
      </footer>
    </div>
  )
}
