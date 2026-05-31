import { useEffect, useRef } from "react";

const TICKER_ITEMS = [
  { name: "USD/KZT", value: "450.12",  change: "+0.34%", up: true  },
  { name: "EUR/KZT", value: "487.55",  change: "−0.12%", up: false },
  { name: "RUB/KZT", value: "4.92",    change: "+0.08%", up: true  },
  { name: "KASE",    value: "3 241.5", change: "+1.23%", up: true  },
  { name: "GOLD",    value: "2 310 $", change: "−0.51%", up: false },
  { name: "BTC/KZT", value: "46.2M",   change: "+2.14%", up: true  },
  { name: "ETH/KZT", value: "1.78M",   change: "+0.87%", up: true  },
  { name: "CNY/KZT", value: "61.40",   change: "−0.04%", up: false },
];

const FLOAT_LABELS = [
  "+2.4%", "−1.1%", "+0.8%", "974K", "217K",
  "₸", "▲", "▼", "KZT", "+5.2%", "−0.3%", "120д", "+3.1%",
];

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number; size: number;
  label: string; color: string;
};

const STEP = 28;

export function AuthBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 36 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      vx:    (Math.random() - 0.5) * 0.22,
      vy:    (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.18 + 0.04,
      size:  Math.random() * 4 + 9,
      label: FLOAT_LABELS[Math.floor(Math.random() * FLOAT_LABELS.length)],
      color: Math.random() > 0.5 ? "#1e5e3e" : "#2d8a5e",
    }));

    let sparkYs: number[]  = [];
    let totalScroll        = 0;
    let trimmed            = 0;

    function seedSpark() {
      sparkYs = [];
      let y = H * 0.58;
      const count = Math.ceil(W / STEP) + 8;
      for (let i = 0; i < count; i++) {
        y = Math.max(H * 0.28, Math.min(H * 0.82, y + (Math.random() - 0.47) * 38));
        sparkYs.push(y);
      }
    }
    seedSpark();

    function drawSpark() {
      const skip   = Math.floor(totalScroll / STEP) - trimmed;
      const pixOff = totalScroll % STEP;

      ctx!.save();
      ctx!.beginPath();
      let started = false;

      for (let i = 0; ; i++) {
        const idx = skip + i;
        if (idx >= sparkYs.length) break;
        const x = i * STEP - pixOff;
        if (x > W + STEP) break;
        const y = sparkYs[idx];
        if (!started) {
          ctx!.moveTo(x, y);
          started = true;
        } else {
          const px = (i - 1) * STEP - pixOff;
          const py = sparkYs[idx - 1];
          const mx = (px + x) / 2;
          ctx!.bezierCurveTo(mx, py, mx, y, x, y);
        }
      }

      const sg = ctx!.createLinearGradient(0, 0, W, 0);
      sg.addColorStop(0,   "rgba(30,94,62,0)");
      sg.addColorStop(0.3, "rgba(30,94,62,.12)");
      sg.addColorStop(0.7, "rgba(45,138,94,.12)");
      sg.addColorStop(1,   "rgba(45,138,94,0)");
      ctx!.strokeStyle = sg;
      ctx!.lineWidth   = 1.6;
      ctx!.stroke();

      ctx!.lineTo(W + 60, H + 60);
      ctx!.lineTo(-60,    H + 60);
      ctx!.closePath();

      const fg = ctx!.createLinearGradient(0, H * 0.4, 0, H);
      fg.addColorStop(0, "rgba(30,94,62,.07)");
      fg.addColorStop(1, "rgba(30,94,62,0)");
      ctx!.fillStyle = fg;
      ctx!.fill();
      ctx!.restore();
    }

    function frame() {
      ctx!.clearRect(0, 0, W, H);
      totalScroll += 0.28;

      const neededIdx = Math.floor(totalScroll / STEP) - trimmed + Math.ceil(W / STEP) + 4;
      while (sparkYs.length < neededIdx) {
        const last = sparkYs[sparkYs.length - 1];
        sparkYs.push(
          Math.max(H * 0.28, Math.min(H * 0.82, last + (Math.random() - 0.47) * 38))
        );
      }
      const dropBefore = Math.floor(totalScroll / STEP) - trimmed - 2;
      if (dropBefore > 60) {
        sparkYs.splice(0, 50);
        trimmed += 50;
      }

      drawSpark();

      ctx!.save();
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -60)   p.x = W + 60;
        if (p.x > W + 60) p.x = -60;
        if (p.y < -20)   p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle   = p.color;
        ctx!.font        = `${p.size}px 'Space Mono', monospace`;
        ctx!.fillText(p.label, p.x, p.y);
      }
      ctx!.restore();

      rafRef.current = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tickerAll = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      {/* Animated canvas — spark line + floating labels */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30,94,62,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,94,62,.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Orb 1 — top-right */}
      <div
        className="pointer-events-none fixed z-[1] rounded-full"
        style={{
          width: 600, height: 600,
          background: "radial-gradient(circle, #6fcf97, transparent 70%)",
          filter: "blur(100px)",
          opacity: 0.18,
          top: -200, right: -100,
          animation: "auth-drift 20s ease-in-out infinite alternate",
        }}
      />
      {/* Orb 2 — bottom-left */}
      <div
        className="pointer-events-none fixed z-[1] rounded-full"
        style={{
          width: 480, height: 480,
          background: "radial-gradient(circle, #a8d5b8, transparent 70%)",
          filter: "blur(100px)",
          opacity: 0.18,
          bottom: -100, left: -120,
          animation: "auth-drift 26s ease-in-out infinite alternate",
          animationDelay: "-9s",
        }}
      />
      {/* Orb 3 — center faint */}
      <div
        className="pointer-events-none fixed z-[1] rounded-full"
        style={{
          width: 260, height: 260,
          background: "radial-gradient(circle, #1e5e3e, transparent 70%)",
          filter: "blur(100px)",
          opacity: 0.1,
          top: "50%", left: "30%",
          animation: "auth-drift 32s ease-in-out infinite alternate",
          animationDelay: "-5s",
        }}
      />

      {/* Ticker bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex h-[30px] items-center overflow-hidden border-t"
        style={{
          background:    "rgba(255,255,255,.92)",
          borderColor:   "rgba(30,94,62,.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="flex shrink-0 gap-[52px] whitespace-nowrap"
          style={{ animation: "auth-ticker 32s linear infinite" }}
        >
          {tickerAll.map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10.5,
                  color: "rgba(13,31,22,.45)",
                }}
              >
                {t.name}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#0d1f16",
                }}
              >
                {t.value}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10.5,
                  color: t.up ? "#1e7a4a" : "#d93025",
                }}
              >
                {t.change}
              </span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
