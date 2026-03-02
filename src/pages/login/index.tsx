import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/shared/const";
import { ROUTES } from "@/shared/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui";
import LoginForm from "@/features/auth-login/ui/login-form";

export function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(15,23,42,0.14),transparent_30%),radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.15),transparent_34%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <Card className="w-full overflow-hidden border-slate-200 bg-white shadow-2xl shadow-slate-300/30">
          <div className="grid lg:grid-cols-[1.08fr_1fr]">
            <section className="relative hidden bg-slate-950 px-10 py-12 text-white lg:block">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_36%)]" />

              <div className="relative">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-300">
                  {APP_NAME}
                </p>
                <h1 className="mt-4 text-3xl font-semibold leading-tight">
                  Secure sign in
                </h1>
                <p className="mt-4 max-w-md text-sm text-slate-300">
                  Используйте рабочий email и пароль для доступа к финансовому
                  кабинету.
                </p>
              </div>

              <div className="relative mt-10 space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-300" />
                  <div>
                    <p className="text-sm font-medium">
                      Защищенная авторизация
                    </p>
                    <p className="text-xs text-slate-300">
                      Доступ только для авторизованных пользователей.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-300" />
                  <div>
                    <p className="text-sm font-medium">Рабочее пространство</p>
                    <p className="text-xs text-slate-300">
                      Транзакции, счета и категории в одном интерфейсе.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="px-6 py-8 sm:px-10 sm:py-12">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl tracking-tight">Войти</CardTitle>
                <CardDescription>
                  Введите email и пароль для входа в аккаунт.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0 pb-0">
                <LoginForm />
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Нет аккаунта?{" "}
                  <Link
                    to={ROUTES.register}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Зарегистрироваться
                  </Link>
                </p>
              </CardContent>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
