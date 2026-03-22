import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@/shared/const";
import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui";

/* ─── Font injection ─── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    * { box-sizing: border-box; }

    .lp-root {
      font-family: 'DM Sans', sans-serif;
      background: #0c0c0c;
      color: #ede8e0;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .lp-root ::selection {
      background: #c8f135;
      color: #0c0c0c;
    }

    .serif { font-family: 'DM Serif Display', serif; }
    .mono  { font-family: 'DM Mono', monospace; }

    /* ─── Grain overlay ─── */
    .lp-root::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999;
      opacity: .025;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 180px;
    }

    /* ─── Marquee ─── */
    .marquee-track {
      display: flex;
      gap: 0;
      animation: marquee 28s linear infinite;
      white-space: nowrap;
    }
    .marquee-track:hover { animation-play-state: paused; }
    @keyframes marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    /* ─── Fade-up on scroll ─── */
    .fade-up {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
    }
    .fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ─── Hover line link ─── */
    .underline-link {
      position: relative;
      display: inline-block;
    }
    .underline-link::after {
      content: '';
      position: absolute;
      left: 0; bottom: -2px;
      width: 100%; height: 1px;
      background: #c8f135;
      transform: scaleX(0);
      transform-origin: right;
      transition: transform .3s cubic-bezier(.76,0,.24,1);
    }
    .underline-link:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }

    /* ─── Accent button ─── */
    .btn-accent {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #c8f135;
      color: #0c0c0c;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: .04em;
      text-transform: uppercase;
      padding: 14px 28px;
      border: none;
      cursor: pointer;
      transition: background .2s, transform .15s;
    }
    .btn-accent:hover { background: #d4f54e; transform: translateY(-1px); }
    .btn-accent:active { transform: translateY(0); }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      color: #ede8e0;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: .04em;
      text-transform: uppercase;
      padding: 13px 27px;
      border: 1px solid rgba(237,232,224,.2);
      cursor: pointer;
      transition: border-color .2s, color .2s;
    }
    .btn-ghost:hover { border-color: rgba(237,232,224,.6); color: #fff; }

    /* ─── Divider ─── */
    .rule { border: none; border-top: 1px solid rgba(237,232,224,.1); }

    /* ─── Module card hover ─── */
    .mod-card {
      border-top: 1px solid rgba(237,232,224,.1);
      padding: 32px 0;
      display: grid;
      grid-template-columns: 40px 1fr 1fr auto;
      align-items: start;
      gap: 24px;
      transition: background .2s;
      cursor: default;
    }
    .mod-card:hover { background: rgba(200,241,53,.03); }
    .mod-card:last-child { border-bottom: 1px solid rgba(237,232,224,.1); }

    @media (max-width: 768px) {
      .mod-card { grid-template-columns: 1fr; gap: 12px; }
      .mod-idx { display: none; }
    }

    /* ─── Step card ─── */
    .step-item {
      display: grid;
      grid-template-columns: 56px 1fr;
      gap: 20px;
      align-items: start;
      padding: 28px 0;
      border-bottom: 1px solid rgba(237,232,224,.1);
    }

    /* ─── Stat block ─── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
    }
    .stat-item {
      padding: 40px 32px;
      border-right: 1px solid rgba(237,232,224,.1);
    }
    .stat-item:last-child { border-right: none; }

    @media (max-width: 900px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
      .stat-item:nth-child(2) { border-right: none; }
      .stat-item:nth-child(3) { border-right: 1px solid rgba(237,232,224,.1); }
      .stat-item:nth-child(3), .stat-item:nth-child(4) {
        border-top: 1px solid rgba(237,232,224,.1);
      }
    }

    @media (max-width: 500px) {
      .stat-grid { grid-template-columns: 1fr; }
      .stat-item { border-right: none; border-bottom: 1px solid rgba(237,232,224,.1); }
    }
  `}</style>
);

/* ─── Fade-up hook ─── */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const FadeUp = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useFadeUp();
  return (
    <div
      ref={ref}
      className={`fade-up ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ─── Data ─── */
const modules = [
  {
    title: "Журнал операций",
    desc: "Единый реестр доходов, расходов и переводов с фиксацией в реальном времени.",
    kpi: "Real-time",
  },
  {
    title: "Категоризация",
    desc: "Гибкая классификация потоков по пользовательским категориям.",
    kpi: "Flexible",
  },
  {
    title: "Курсы валют",
    desc: "Динамика валют и криптоактивов через живые SSE-потоки.",
    kpi: "Live SSE",
  },
  {
    title: "Переводы",
    desc: "Атомарное перемещение средств с сохранением консистентности баланса.",
    kpi: "Atomic",
  },
];

const steps = [
  {
    n: "01",
    title: "Настройте контур учёта",
    desc: "Добавьте счета и категории под вашу реальную структуру финансов.",
  },
  {
    n: "02",
    title: "Перенесите операции",
    desc: "Фиксируйте каждое событие в момент его возникновения.",
  },
  {
    n: "03",
    title: "Решайте на данных",
    desc: "Опирайтесь на динамику остатков, а не на интуицию.",
  },
];

const kpiItems = [
  "12 счетов",
  "1 248 операций / мес",
  "99.7% точность",
  "$128.40 средний чек",
  "Live SSE-данные",
  "Типизированная модель",
  "12 счетов",
  "1 248 операций / мес",
  "99.7% точность",
  "$128.40 средний чек",
  "Live SSE-данные",
  "Типизированная модель",
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <FontLink />
      <div className="lp-root">
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(237,232,224,.1)",
            backdropFilter: "blur(20px)",
            background: "rgba(12,12,12,.85)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 32px",
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              className="mono"
              style={{ fontSize: 15, letterSpacing: ".06em", color: "#c8f135" }}
            >
              {APP_NAME}
            </span>

            <nav
              style={{ display: "flex", gap: 36 }}
              className="hidden md:flex"
            >
              {[
                ["#scope", "Обзор"],
                ["#modules", "Модули"],
                ["#rollout", "Внедрение"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="underline-link"
                  style={{
                    fontSize: 13,
                    color: "rgba(237,232,224,.55)",
                    letterSpacing: ".03em",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>

            <Link to={ROUTES.app}>
              <button
                className="btn-accent"
                style={{ padding: "8px 20px", fontSize: 12 }}
              >
                Войти <ArrowRight size={13} />
              </button>
            </Link>
          </div>
        </header>

        <section
          id="scope"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "80px 32px 60px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "start",
              gap: 48,
              marginBottom: 56,
            }}
          >
            <div>
              <p
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: ".18em",
                  color: "#c8f135",
                  textTransform: "uppercase",
                  marginBottom: 28,
                }}
              >
                — Консоль финансовых операций
              </p>
              <h1
                className="serif"
                style={{
                  fontSize: "clamp(52px, 7vw, 96px)",
                  lineHeight: 1.02,
                  fontWeight: 400,
                  margin: 0,
                  letterSpacing: "-.02em",
                }}
              >
                Управляйте
                <br />
                <span
                  style={{
                    fontStyle: "italic",
                    color: "rgba(237,232,224,.45)",
                  }}
                >
                  личными
                </span>
                <br />
                финансами
              </h1>
            </div>
            <div
              style={{ paddingTop: 8, maxWidth: 280, textAlign: "right" }}
              className="hidden md:block"
            >
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "rgba(237,232,224,.5)",
                  marginBottom: 0,
                }}
              >
                {APP_TAGLINE}
              </p>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(237,232,224,.1)",
              paddingTop: 40,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 32,
            }}
          >
            <div>
              <p
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: ".12em",
                  color: "rgba(237,232,224,.4)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Совокупный баланс
              </p>
              <p
                className="serif"
                style={{
                  fontSize: "clamp(42px, 6vw, 80px)",
                  margin: 0,
                  lineHeight: 1,
                  letterSpacing: "-.02em",
                }}
              >
                $19,341<span style={{ color: "#c8f135" }}>.20</span>
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 40,
                flexWrap: "wrap",
                paddingBottom: 8,
              }}
            >
              {[
                { label: "Доходы (30д)", val: "+$3,520", pos: true },
                { label: "Расходы (30д)", val: "−$1,860", pos: false },
                { label: "Net Flow", val: "+$1,660", pos: true },
              ].map(({ label, val, pos }) => (
                <div key={label}>
                  <p
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "rgba(237,232,224,.35)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    className="mono"
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      color: pos ? "#c8f135" : "rgba(237,232,224,.8)",
                      margin: 0,
                    }}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>
            <Link to={ROUTES.app}>
              <button className="btn-accent">
                Открыть рабочее пространство <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </section>

        <div
          style={{
            borderTop: "1px solid rgba(237,232,224,.1)",
            borderBottom: "1px solid rgba(237,232,224,.1)",
            overflow: "hidden",
            padding: "14px 0",
          }}
        >
          <div className="marquee-track">
            {[...kpiItems, ...kpiItems].map((item, i) => (
              <span
                key={i}
                className="mono"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "0 24px",
                  fontSize: 12,
                  letterSpacing: ".08em",
                  color: "rgba(237,232,224,.45)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "#c8f135", fontSize: 8 }}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <FadeUp>
          <div style={{ borderBottom: "1px solid rgba(237,232,224,.1)" }}>
            <div
              className="stat-grid"
              style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}
            >
              {[
                { n: "12", label: "активных счетов" },
                { n: "1,248", label: "операций в месяц" },
                { n: "99.7%", label: "точность учёта" },
                { n: "$128", label: "средний чек" },
              ].map(({ n, label }) => (
                <div key={label} className="stat-item">
                  <p
                    className="serif"
                    style={{
                      fontSize: 52,
                      margin: "0 0 6px",
                      lineHeight: 1,
                      letterSpacing: "-.02em",
                    }}
                  >
                    {n}
                  </p>
                  <p
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "rgba(237,232,224,.4)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        <section
          id="modules"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "88px 32px 80px",
          }}
        >
          <FadeUp>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 48,
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <h2
                className="serif"
                style={{
                  fontSize: "clamp(32px, 4vw, 52px)",
                  margin: 0,
                  fontWeight: 400,
                  letterSpacing: "-.02em",
                }}
              >
                Функциональные
                <br />
                <span
                  style={{ fontStyle: "italic", color: "rgba(237,232,224,.4)" }}
                >
                  модули
                </span>
              </h2>
              <p
                className="mono"
                style={{
                  fontSize: 12,
                  letterSpacing: ".12em",
                  color: "rgba(237,232,224,.35)",
                  textTransform: "uppercase",
                  maxWidth: 220,
                  textAlign: "right",
                }}
              >
                Не набор карточек — операционная система учёта
              </p>
            </div>
          </FadeUp>

          {modules.map((mod, i) => (
            <FadeUp key={mod.title} delay={i * 60}>
              <div className="mod-card">
                <span
                  className="mono mod-idx"
                  style={{
                    fontSize: 11,
                    color: "rgba(237,232,224,.25)",
                    paddingTop: 4,
                  }}
                >
                  0{i + 1}
                </span>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    margin: 0,
                    letterSpacing: "-.01em",
                  }}
                >
                  {mod.title}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(237,232,224,.5)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {mod.desc}
                </p>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#c8f135",
                    whiteSpace: "nowrap",
                  }}
                >
                  {mod.kpi}
                </span>
              </div>
            </FadeUp>
          ))}
        </section>

        <section
          id="rollout"
          style={{
            borderTop: "1px solid rgba(237,232,224,.1)",
            background: "rgba(255,255,255,.015)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "88px 32px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "start",
            }}
          >
            <FadeUp>
              <div>
                <p
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: ".16em",
                    color: "#c8f135",
                    textTransform: "uppercase",
                    marginBottom: 20,
                  }}
                >
                  — План внедрения
                </p>
                <h2
                  className="serif"
                  style={{
                    fontSize: "clamp(32px, 3.5vw, 48px)",
                    margin: "0 0 20px",
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: "-.02em",
                  }}
                >
                  Запуск
                  <br />
                  без лишнего
                  <br />
                  <span
                    style={{
                      fontStyle: "italic",
                      color: "rgba(237,232,224,.4)",
                    }}
                  >
                    overhead
                  </span>
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(237,232,224,.45)",
                    lineHeight: 1.65,
                    marginBottom: 36,
                  }}
                >
                  Пошаговый сценарий, который переводит учёт из хаотичного
                  режима в управляемый процесс.
                </p>
                <Link to={ROUTES.app}>
                  <button className="btn-accent">
                    Начать работу <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </FadeUp>

            <div>
              {steps.map((s, i) => (
                <FadeUp key={s.n} delay={i * 80}>
                  <div className="step-item">
                    <span
                      className="mono"
                      style={{ fontSize: 13, color: "#c8f135", paddingTop: 2 }}
                    >
                      {s.n}
                    </span>
                    <div>
                      <p
                        style={{
                          fontSize: 17,
                          fontWeight: 500,
                          margin: "0 0 8px",
                          letterSpacing: "-.01em",
                        }}
                      >
                        {s.title}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "rgba(237,232,224,.45)",
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        <FadeUp>
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "24px 32px 80px",
            }}
          >
            <div
              style={{
                background: "#c8f135",
                color: "#0c0c0c",
                padding: "48px 56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 32,
              }}
            >
              <div>
                <p
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    opacity: 0.5,
                    marginBottom: 10,
                  }}
                >
                  — Доступ к рабочему контуру
                </p>
                <h3
                  className="serif"
                  style={{
                    fontSize: "clamp(28px, 3vw, 42px)",
                    margin: 0,
                    fontWeight: 400,
                    letterSpacing: "-.02em",
                    lineHeight: 1.1,
                  }}
                >
                  Перейдите к управлению
                  <br />
                  финансами сегодня
                </h3>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link to={ROUTES.app}>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#0c0c0c",
                      color: "#c8f135",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                      padding: "14px 28px",
                      border: "none",
                      cursor: "pointer",
                      transition: "opacity .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = ".8")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Открыть приложение <ArrowUpRight size={14} />
                  </button>
                </Link>
                <a href="#scope">
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "transparent",
                      color: "#0c0c0c",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                      fontWeight: 400,
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                      padding: "13px 27px",
                      border: "1px solid rgba(12,12,12,.25)",
                      cursor: "pointer",
                      transition: "border-color .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(12,12,12,.7)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(12,12,12,.25)")
                    }
                  >
                    Наверх <Minus size={13} />
                  </button>
                </a>
              </div>
            </div>
          </div>
        </FadeUp>

        <footer
          style={{
            borderTop: "1px solid rgba(237,232,224,.1)",
            padding: "28px 32px",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 12,
                color: "rgba(237,232,224,.25)",
                letterSpacing: ".06em",
              }}
            >
              {APP_NAME} — {new Date().getFullYear()}
            </span>
            <span
              className="mono"
              style={{
                fontSize: 12,
                color: "rgba(237,232,224,.2)",
                letterSpacing: ".04em",
              }}
            >
              Structured UI for finance operations
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
