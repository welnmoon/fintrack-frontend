import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, Link } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { loginSchema, type LoginSchemaType } from "@/features/auth-login/model/schema";
import { useLogin } from "@/features/auth-login/api/use-login";
import { useGetUser } from "@/entities/user/api/use-get-user";
import { ROUTES } from "@/shared/config";
import { AuthBg } from "@/shared/ui/components/auth-bg";
import { AuthInput } from "@/shared/ui/components/auth-input";

const PILLS = [
  {
    label: "Баланс",
    value: "974 440 ₸",
    valueColor: "#1e5e3e",
    pos: { top: "9%", left: "6%" },
    delay: "0s",
  },
  {
    label: "Доход / мес",
    value: "+217 000 ₸",
    valueColor: "#1e7a4a",
    pos: { top: "13%", right: "7%" },
    delay: "-2.5s",
  },
  {
    label: "Net",
    value: "−308 380 ₸",
    valueColor: "#d93025",
    pos: { bottom: "22%", left: "5%" },
    delay: "-4s",
  },
  {
    label: "Средств хватит",
    value: "120 дн.",
    valueColor: "#2563eb",
    pos: { bottom: "11%", right: "6%" },
    delay: "-1.2s",
  },
];

export function LoginPage() {
  const [btnHover, setBtnHover] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const form = useForm<LoginSchemaType>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const { data: userData, isLoading: isGetUserLoading } = useGetUser();
  const { mutate, isPending, isSuccess, error } = useLogin();

  const isBusy = isPending || isGetUserLoading;

  const onSubmit = (values: LoginSchemaType) => {
    if (isBusy) return;
    mutate(values);
  };

  const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const sz = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    Object.assign(ripple.style, {
      position:     "absolute",
      borderRadius: "50%",
      background:   "rgba(255,255,255,.25)",
      width:        `${sz}px`,
      height:       `${sz}px`,
      left:         `${e.clientX - rect.left - sz / 2}px`,
      top:          `${e.clientY - rect.top - sz / 2}px`,
      transform:    "scale(0)",
      animation:    "auth-ripple .55s linear forwards",
      pointerEvents: "none",
    });
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  if (userData || isSuccess) return <Navigate to={ROUTES.app} />;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-[38px]"
      style={{ background: "#f0f5f2", fontFamily: "'DM Sans', sans-serif" }}
    >
      <AuthBg />

      {/* Floating stat pills — only on large screens */}
      {PILLS.map((pill, i) => (
        <div
          key={i}
          className="pointer-events-none fixed z-[3] hidden lg:block"
          style={{
            ...pill.pos,
            padding:        "10px 16px",
            background:     "rgba(255,255,255,.82)",
            border:         "1px solid rgba(30,94,62,.1)",
            borderRadius:   14,
            backdropFilter: "blur(14px)",
            boxShadow:      "0 4px 20px rgba(30,94,62,.08)",
            animation:      `auth-float-y 7s ease-in-out infinite`,
            animationDelay: pill.delay,
          }}
        >
          <div
            style={{
              fontFamily:    "'Space Mono', monospace",
              fontSize:      9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:         "rgba(13,31,22,.45)",
            }}
          >
            {pill.label}
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize:   13,
              fontWeight: 700,
              marginTop:  3,
              color:      pill.valueColor,
            }}
          >
            {pill.value}
          </div>
        </div>
      ))}

      {/* ── Auth card ── */}
      <div
        className="relative z-10 w-full"
        style={{
          maxWidth:  420,
          animation: "auth-card-in .9s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        <div
          style={{
            padding:      "44px 40px",
            background:   "#ffffff",
            borderRadius: 26,
            border:       "1px solid rgba(30,94,62,.1)",
            boxShadow:    "0 20px 60px rgba(30,94,62,.1), 0 4px 16px rgba(30,94,62,.06)",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
            <span
              style={{
                fontFamily:    "'Syne', sans-serif",
                fontWeight:    800,
                fontSize:      20,
                color:         "#0d1f16",
                letterSpacing: "0.1em",
              }}
            >
              FINTRACK
            </span>
            <span
              style={{
                display:      "inline-block",
                width:        6,
                height:       6,
                borderRadius: "50%",
                background:   "#2d8a5e",
                boxShadow:    "0 0 8px rgba(45,138,94,.5)",
                marginLeft:   6,
                marginTop:    2,
                animation:    "auth-blink 2s ease-in-out infinite",
              }}
            />
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily:  "'Syne', sans-serif",
              fontWeight:  800,
              fontSize:    38,
              lineHeight:  1.05,
              color:       "#0d1f16",
              marginBottom: 6,
            }}
          >
            Войти<span style={{ color: "#2d8a5e" }}>.</span>
          </h1>
          <p
            style={{
              fontSize:      13.5,
              color:         "rgba(13,31,22,.45)",
              fontWeight:    300,
              marginBottom:  36,
              letterSpacing: "0.01em",
            }}
          >
            Доступ к финансовому кабинету
          </p>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <AuthInput
                  label="Email"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isBusy}
                  error={fieldState.error?.message}
                  name={field.name}
                />
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <AuthInput
                  label="Пароль"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isBusy}
                  error={fieldState.error?.message}
                  name={field.name}
                />
              )}
            />

            {/* Forgot password */}
            <div style={{ display: "flex", justifyContent: "flex-end", margin: "-8px 0 30px" }}>
              <span
                style={{
                  fontSize: 13,
                  color:    "#2d8a5e",
                  opacity:  0.8,
                  cursor:   "default",
                }}
                title="Функция в разработке"
              >
                Забыл пароль?
              </span>
            </div>

            {/* Submit button */}
            <button
              ref={btnRef}
              type="submit"
              disabled={isBusy}
              onClick={handleRipple}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width:        "100%",
                padding:      16,
                background:   "linear-gradient(135deg, #1e5e3e 0%, #2d8a5e 100%)",
                border:       "none",
                borderRadius: 12,
                color:        "#fff",
                fontFamily:   "'Syne', sans-serif",
                fontWeight:   700,
                fontSize:     15,
                letterSpacing: "0.06em",
                cursor:       isBusy ? "not-allowed" : "pointer",
                position:     "relative",
                overflow:     "hidden",
                opacity:      isBusy ? 0.7 : 1,
                transform:    btnHover && !isBusy ? "translateY(-2px)" : "none",
                boxShadow:    btnHover && !isBusy ? "0 10px 32px rgba(30,94,62,.3)" : "none",
                transition:   "transform .2s, box-shadow .25s",
              }}
            >
              {isPending ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <HashLoader size={16} color="#fff" />
                  Выполняется вход...
                </span>
              ) : (
                "Войти"
              )}
            </button>

            {error instanceof Error && (
              <p
                style={{
                  color:     "#d93025",
                  fontSize:  13,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {error.message}
              </p>
            )}
          </form>

          {/* Divider */}
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        14,
              margin:     "24px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "rgba(13,31,22,.08)" }} />
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize:   11,
                color:      "rgba(13,31,22,.45)",
              }}
            >
              или
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(13,31,22,.08)" }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: 13.5, color: "rgba(13,31,22,.45)" }}>
            Нет аккаунта?{" "}
            <Link
              to={ROUTES.register}
              style={{ color: "#2d8a5e", textDecoration: "none", fontWeight: 500 }}
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
