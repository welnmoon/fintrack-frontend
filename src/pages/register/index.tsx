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
import RegisterForm from "@/features/auth-login/ui/register-form";

export function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(15,23,42,0.14),transparent_30%),radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.15),transparent_34%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <Card className="w-full overflow-hidden border-slate-200 bg-white shadow-2xl shadow-slate-300/30">
          <div className="grid lg:grid-cols-[1fr_1.08fr]">
            <section className="px-6 py-8 sm:px-10 sm:py-12">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl tracking-tight">
                  Создать аккаунт
                </CardTitle>
                <CardDescription>
                  Заполните данные для регистрации нового пользователя.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0 pb-0">
                <RegisterForm />
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Уже есть аккаунт?{" "}
                  <Link
                    to={ROUTES.login}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Войти
                  </Link>
                </p>
              </CardContent>
            </section>

            <section className="relative hidden bg-slate-950 px-10 py-12 text-white lg:block">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_36%)]" />

              <div className="relative">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-300">
                  {APP_NAME}
                </p>
                <h1 className="mt-4 text-3xl font-semibold leading-tight">
                  Create your workspace
                </h1>
                <p className="mt-4 max-w-md text-sm text-slate-300">
                  После регистрации вы сможете вести учет доходов, расходов и
                  переводов в одном кабинете.
                </p>
              </div>

              <ul className="relative mt-10 space-y-4 text-sm">
                <li className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-300" />
                  <span>Безопасный доступ к персональным данным</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-300" />
                  <span>Управление счетами, категориями и транзакциями</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-300" />
                  <span>Готовая база для финансовой аналитики</span>
                </li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
