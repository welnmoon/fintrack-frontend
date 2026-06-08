import { useTheme } from "@/app/providers/theme-provider";
import { cn } from "@/shared/lib";
import { BACKEND_URL } from "@/shared/config/api";
import { USER_PLAN } from "@/shared/model/plan";
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import {
  AU,
  CA,
  CH,
  CN,
  EU,
  GB,
  JP,
  KZ,
  NZ,
  US,
} from "country-flag-icons/react/3x2";
import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart,
  type AreaData,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";

export type ForexInterval = "1min" | "5min" | "15min" | "1h" | "4h" | "1day";
export type ForexChartType = "area" | "candles";

type ForexSseSnapshot = {
  symbol: string;
  interval: ForexInterval;
  updatedAt: string;
  lastPrice: number;
  stale: boolean;
  sourceUnavailable: boolean;
  backfillCompleted: boolean;
  lastSuccessfulSyncAt: string | null;
  lastFailedSyncAt: string | null;
  lastErrorMessage: string | null;
  candles: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
};

export const FOREX_SYMBOL_OPTIONS = [
  { symbol: "USD/KZT", baseCode: "US", quoteCode: "KZ", enabled: true },
  { symbol: "EUR/KZT", baseCode: "EU", quoteCode: "KZ", enabled: true },
  { symbol: "EUR/USD", baseCode: "EU", quoteCode: "US", enabled: true },
  { symbol: "GBP/USD", baseCode: "GB", quoteCode: "US", enabled: false },
  { symbol: "USD/JPY", baseCode: "US", quoteCode: "JP", enabled: false },
  { symbol: "USD/CNY", baseCode: "US", quoteCode: "CN", enabled: false },
  { symbol: "USD/CHF", baseCode: "US", quoteCode: "CH", enabled: false },
  { symbol: "AUD/USD", baseCode: "AU", quoteCode: "US", enabled: false },
  { symbol: "USD/CAD", baseCode: "US", quoteCode: "CA", enabled: false },
  { symbol: "NZD/USD", baseCode: "NZ", quoteCode: "US", enabled: false },
] as const;
type SymbolType = (typeof FOREX_SYMBOL_OPTIONS)[number]["symbol"];
type CountryCode = "AU" | "CA" | "CH" | "CN" | "EU" | "GB" | "JP" | "KZ" | "NZ" | "US";

const INTERVAL_OPTIONS: ForexInterval[] = [
  "1min",
  "5min",
  "15min",
  "1h",
  "4h",
  "1day",
];

const INTERVAL_LABEL_SHORT: Record<ForexInterval, string> = {
  "1min": "1m",
  "5min": "5m",
  "15min": "15m",
  "1h": "1h",
  "4h": "4h",
  "1day": "1д",
};

const CHART_TYPE_OPTIONS: Array<{
  value: ForexChartType;
  label: string;
}> = [
  { value: "area", label: "Линия" },
  { value: "candles", label: "Свечи" },
];

type Props = {
  symbol?: SymbolType;
  interval?: ForexInterval;
  chartType?: ForexChartType;
  showChartTypeControl?: boolean;
  showExtendedMeta?: boolean;
  chartViewportClassName?: string;
  className?: string;
  variant?: "default" | "dashboard" | "page";
};

type Status = "connecting" | "live" | "stale" | "error";

type ThemePalette = {
  background: string;
  text: string;
  border: string;
  grid: string;
  line: string;
  lineSoft: string;
  lineFade: string;
  up: string;
  down: string;
};

const FLAG_COMPONENTS: Record<CountryCode, any> = {
  AU,
  CA,
  CH,
  CN,
  EU,
  GB,
  JP,
  KZ,
  NZ,
  US,
};

function getForexPairMeta(symbol: SymbolType) {
  return (
    FOREX_SYMBOL_OPTIONS.find((item) => item.symbol === symbol) ??
    FOREX_SYMBOL_OPTIONS[0]
  );
}

function PairFlag({ code, tone }: { code: CountryCode; tone: "base" | "quote" }) {
  const Flag = FLAG_COMPONENTS[code];

  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border shadow-[0_1px_2px_rgba(17,17,17,0.08)]",
        tone === "base"
          ? "border-[#D7D2C8] bg-[#F6F1E8]"
          : "border-[#D6E2EA] bg-[#EDF5FA]",
      )}
      aria-hidden="true"
    >
      <Flag className="h-full w-full object-cover" />
    </span>
  );
}

function PairLabel({ symbol }: { symbol: SymbolType }) {
  const meta = getForexPairMeta(symbol);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex -space-x-1">
        <PairFlag code={meta.baseCode} tone="base" />
        <PairFlag code={meta.quoteCode} tone="quote" />
      </span>
      <span>{symbol}</span>
    </span>
  );
}

function PairSelect({
  value,
  onChange,
  triggerClassName,
}: {
  value: SymbolType;
  onChange: (value: SymbolType) => void;
  triggerClassName?: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SymbolType)}>
      <SelectTrigger className={cn("w-[190px]", triggerClassName)}>
        <SelectValue placeholder="Пара" />
      </SelectTrigger>
      <SelectContent>
        {FOREX_SYMBOL_OPTIONS.map((item) => (
          <SelectItem
            key={item.symbol}
            value={item.symbol}
            disabled={USER_PLAN === "FREE" && !item.enabled}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <PairLabel symbol={item.symbol} />
              {USER_PLAN === "FREE" && !item.enabled ? (
                <span className="text-[10px] text-muted-foreground">
                  Premium
                </span>
              ) : null}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function readCssColor(
  variableName: string,
  fallback: string,
  alpha?: number,
) {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  if (!value) return fallback;

  return alpha === undefined ? `hsl(${value})` : `hsl(${value} / ${alpha})`;
}

function getThemePalette(): ThemePalette {
  return {
    background: readCssColor("--card", "#ffffff"),
    text: readCssColor("--foreground", "#1f2937"),
    border: readCssColor("--border", "#d1d5db"),
    grid: readCssColor("--border", "rgba(209, 213, 219, 0.35)", 0.35),
    line: readCssColor("--primary", "#2962ff"),
    lineSoft: readCssColor("--primary", "rgba(41, 98, 255, 0.24)", 0.24),
    lineFade: readCssColor("--primary", "rgba(41, 98, 255, 0.04)", 0.04),
    up: readCssColor("--accent", "#16a34a"),
    down: readCssColor("--destructive", "#ef4444"),
  };
}

function getStatusLabel(status: Status) {
  switch (status) {
    case "live":
      return "SSE live";
    case "stale":
      return "Источник недоступен, показаны последние данные";
    case "connecting":
      return "Подключение...";
    case "error":
    default:
      return "Поток недоступен";
  }
}

function getStatusVariant(status: Status): "default" | "secondary" | "outline" {
  switch (status) {
    case "live":
      return "default";
    case "stale":
      return "secondary";
    case "connecting":
    case "error":
    default:
      return "outline";
  }
}

export default function PriceChart({
  symbol = "USD/KZT",
  interval = "15min",
  chartType = "area",
  showChartTypeControl = true,
  showExtendedMeta = false,
  chartViewportClassName,
  className,
  variant = "default",
}: Props) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const hasFittedRef = useRef(false);
  const seriesRef = useRef<
    ISeriesApi<"Area"> | ISeriesApi<"Candlestick"> | null
  >(null);

  const [candles, setCandles] = useState<ForexSseSnapshot["candles"]>([]);
  const [status, setStatus] = useState<Status>("connecting");
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolType>(symbol);
  const [selectedInterval, setSelectedInterval] =
    useState<ForexInterval>(interval);
  const [selectedChartType, setSelectedChartType] =
    useState<ForexChartType>(chartType);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [meta, setMeta] = useState<
    Pick<
      ForexSseSnapshot,
      | "symbol"
      | "interval"
      | "updatedAt"
      | "lastPrice"
      | "stale"
      | "sourceUnavailable"
      | "backfillCompleted"
      | "lastSuccessfulSyncAt"
      | "lastFailedSyncAt"
      | "lastErrorMessage"
    > | null
  >(null);

  const areaData = useMemo<AreaData<Time>[]>(
    () =>
      candles.map((candle) => ({
        time: candle.time as Time,
        value: candle.close,
      })),
    [candles],
  );
  const candlestickData = useMemo<CandlestickData<Time>[]>(
    () =>
      candles.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    [candles],
  );

  const resetStreamState = () => {
    startTransition(() => {
      setStatus("connecting");
      setStreamError(null);
      setMeta(null);
      setCandles([]);
    });
    hasFittedRef.current = false;
  };

  useEffect(() => {
    const url = new URL(`${BACKEND_URL}/forex/stream`);
    url.searchParams.set("symbol", selectedSymbol);
    url.searchParams.set("interval", selectedInterval);

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    });

    const applyPayload = (payload: ForexSseSnapshot) => {
      setCandles(payload.candles);
      setMeta({
        symbol: payload.symbol,
        interval: payload.interval,
        updatedAt: payload.updatedAt,
        lastPrice: payload.lastPrice,
        stale: payload.stale,
        sourceUnavailable: payload.sourceUnavailable,
        backfillCompleted: payload.backfillCompleted,
        lastSuccessfulSyncAt: payload.lastSuccessfulSyncAt,
        lastFailedSyncAt: payload.lastFailedSyncAt,
        lastErrorMessage: payload.lastErrorMessage,
      });
      setStatus(payload.sourceUnavailable ? "stale" : "live");
      setStreamError(null);
    };

    const onSnapshot = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as ForexSseSnapshot;
        applyPayload(payload);
      } catch {
        setStatus("error");
      }
    };

    const onCandle = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as ForexSseSnapshot;
        applyPayload(payload);
      } catch {
        setStatus("error");
      }
    };

    const onBackendError = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as { message?: string };
        setStreamError(payload.message ?? "Ошибка потока SSE");
      } catch {
        setStreamError("Ошибка потока SSE");
      }
      setStatus("error");
    };

    eventSource.addEventListener("snapshot", onSnapshot as EventListener);
    eventSource.addEventListener("candle", onCandle as EventListener);
    eventSource.addEventListener("error", onBackendError as EventListener);

    eventSource.onerror = () => {
      setStreamError("Подключение к SSE потеряно");
      setStatus("error");
    };

    return () => {
      eventSource.close();
    };
  }, [selectedInterval, selectedSymbol]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;
    let chart: IChartApi | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const frameId = window.requestAnimationFrame(() => {
      const palette = getThemePalette();

      chart = createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: {
          background: { type: ColorType.Solid, color: palette.background },
          textColor: palette.text,
        },
        grid: {
          vertLines: { color: palette.grid },
          horzLines: { color: palette.grid },
        },
        rightPriceScale: {
          borderColor: palette.border,
        },
        timeScale: {
          borderColor: palette.border,
        },
        crosshair: {
          vertLine: { color: palette.border },
          horzLine: { color: palette.border },
        },
      });

      const series =
        selectedChartType === "candles"
          ? chart.addSeries(CandlestickSeries, {
              upColor: palette.up,
              downColor: palette.down,
              borderUpColor: palette.up,
              borderDownColor: palette.down,
              wickUpColor: palette.up,
              wickDownColor: palette.down,
            })
          : chart.addSeries(AreaSeries, {
            lineColor: palette.line,
            topColor: palette.lineSoft,
            bottomColor: palette.lineFade,
          });

      chart.timeScale().fitContent();
      hasFittedRef.current = false;

      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !chart) return;

        const { width, height } = entry.contentRect;
        chart.applyOptions({
          width,
          height,
        });
        chart.timeScale().fitContent();
      });

      resizeObserver.observe(container);

      chartRef.current = chart;
      seriesRef.current = series;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      chart?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [selectedChartType, theme]);

  useEffect(() => {
    if (!seriesRef.current) return;

    if (selectedChartType === "candles") {
      (seriesRef.current as ISeriesApi<"Candlestick">).setData(candlestickData);
    } else {
      (seriesRef.current as ISeriesApi<"Area">).setData(areaData);
    }

    const pointsCount =
      selectedChartType === "candles" ? candlestickData.length : areaData.length;

    if (!hasFittedRef.current && pointsCount > 0) {
      chartRef.current?.timeScale().fitContent();
      hasFittedRef.current = true;
    }
  }, [areaData, candlestickData, selectedChartType]);

  const chartViewport = (
    <div
      ref={containerRef}
      className={cn(
        "w-full rounded-xl",
        chartViewportClassName ?? "h-[320px] sm:h-[360px]",
      )}
    />
  );

  if (variant === "page") {
    return (
      <div className={cn("flex h-full flex-col overflow-hidden", className)}>
        {/* ── Controls bar ── */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D8] bg-[#FAFAF7] px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <PairSelect
              value={selectedSymbol}
              onChange={(next) => {
                if (next === selectedSymbol) return;
                resetStreamState();
                setSelectedSymbol(next);
              }}
              triggerClassName="h-8 min-w-[210px] border-[#DDD9D1] bg-white"
            />

            <div className="h-5 w-px bg-[#E5E2D8]" />

            {/* Interval pills */}
            <div className="flex flex-wrap gap-1">
              {INTERVAL_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === selectedInterval) return;
                    resetStreamState();
                    setSelectedInterval(item);
                  }}
                  className={cn(
                    "h-6 rounded-[5px] px-2.5 font-mono text-[10px] font-medium text-[#B5B0A8] transition-colors hover:bg-[#F4F2EE] hover:text-[#555]",
                    selectedInterval === item && "bg-[#F0EEE9] font-semibold text-[#333]",
                  )}
                >
                  {INTERVAL_LABEL_SHORT[item]}
                </button>
              ))}
            </div>

            {showChartTypeControl && (
              <>
                <div className="h-5 w-px bg-[#E5E2D8]" />
                <div className="flex items-center gap-1">
                  {CHART_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedChartType(opt.value)}
                      className={cn(
                        "h-6 rounded-[5px] px-2.5 font-mono text-[10px] font-medium text-[#B5B0A8] transition-colors hover:bg-[#F4F2EE] hover:text-[#555]",
                        selectedChartType === opt.value && "bg-[#F0EEE9] font-semibold text-[#333]",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: status + price */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.3px] text-[#AAA49C]">
              {meta?.symbol ?? selectedSymbol} · {INTERVAL_LABEL_SHORT[meta?.interval ?? selectedInterval]}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[10px] font-semibold",
                status === "live"
                  ? "border-[#C2EDD8] bg-[#EDFAF4] text-[#1A9E6A]"
                  : status === "stale"
                    ? "border-[#F3D9A0] bg-[#FEF5E6] text-[#C07C1A]"
                    : "border-[#DDD9D1] bg-[#F7F6F3] text-[#888]",
              )}
            >
              <span
                className={cn(
                  "h-[5px] w-[5px] rounded-full",
                  status === "live" ? "animate-pulse bg-[#1A9E6A]" : "bg-[#AAA49C]",
                )}
              />
              {getStatusLabel(status)}
            </span>
            <span className="rounded-md border border-[#DDD9D1] bg-[#F7F6F3] px-2.5 py-[3px] font-mono text-[12px] font-semibold text-[#111]">
              {meta?.lastPrice ? meta.lastPrice.toFixed(3) : "—"}
            </span>
          </div>
        </div>

        {/* ── Chart fills remaining height ── */}
        <div className="min-h-0 flex-1">
          <div ref={containerRef} className="h-full w-full" />
        </div>

        {/* ── Footer meta ── */}
        <div className="grid flex-shrink-0 grid-cols-2 border-t border-[#E5E2D8] sm:grid-cols-4">
          <div className="border-r border-[#E5E2D8] px-6 py-2.5">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[2px] text-[#C0BCB4]">Пара</p>
            <p className="font-mono text-[13px] font-semibold text-[#333]">
              {meta?.symbol ?? selectedSymbol}
            </p>
          </div>
          <div className="border-r border-[#E5E2D8] px-6 py-2.5">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[2px] text-[#C0BCB4]">Цена</p>
            <p className="font-mono text-[13px] font-semibold text-[#333]">
              {meta?.lastPrice ? meta.lastPrice.toFixed(3) : "Ожидание"}
            </p>
          </div>
          <div className="border-r border-[#E5E2D8] px-6 py-2.5">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[2px] text-[#C0BCB4]">Обновлено</p>
            <p className="font-mono text-[13px] font-semibold text-[#333]">
              {meta?.updatedAt
                ? new Date(meta.updatedAt).toLocaleTimeString("ru-RU")
                : "Ожидание данных"}
            </p>
          </div>
          <div className="px-6 py-2.5">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[2px] text-[#C0BCB4]">История</p>
            <p className={cn("font-mono text-[13px] font-semibold", meta?.backfillCompleted ? "text-[#1A9E6A]" : "text-[#333]")}>
              {meta?.backfillCompleted ? "Синхронизирована" : "Догружается"}
            </p>
          </div>
        </div>

        {(status === "stale" || streamError || meta?.lastErrorMessage) && (
          <p className="flex-shrink-0 border-t border-[#E5E2D8] px-6 py-2.5 text-xs text-amber-600">
            {streamError ?? meta?.lastErrorMessage ?? "Источник котировок недоступен, данные временно заморожены"}
          </p>
        )}
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex flex-col gap-3 border-b border-[#EDEAE4] px-6 py-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <PairSelect
              value={selectedSymbol}
              onChange={(next) => {
                if (next === selectedSymbol) return;
                resetStreamState();
                setSelectedSymbol(next);
              }}
              triggerClassName="h-8 min-w-[210px] border-[#DDD9D1] bg-white"
            />

            <div className="h-5 w-px bg-[#EDEAE4]" />

            <div className="flex flex-wrap gap-1">
              {INTERVAL_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === selectedInterval) return;
                    resetStreamState();
                    setSelectedInterval(item);
                  }}
                  className={cn(
                    "h-6 rounded-[5px] px-2.5 font-mono text-[10px] font-medium text-[#B5B0A8] transition-colors hover:bg-[#F4F2EE] hover:text-[#555]",
                    selectedInterval === item &&
                      "bg-[#F0EEE9] font-semibold text-[#333]",
                  )}
                >
                  {INTERVAL_LABEL_SHORT[item]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.3px] text-[#AAA49C]">
              {meta?.symbol ?? selectedSymbol} ·{" "}
              {INTERVAL_LABEL_SHORT[meta?.interval ?? selectedInterval]}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[10px] font-semibold",
                status === "live"
                  ? "border-[#C2EDD8] bg-[#EDFAF4] text-[#1A9E6A]"
                  : status === "stale"
                    ? "border-[#F3D9A0] bg-[#FEF5E6] text-[#C07C1A]"
                    : "border-[#DDD9D1] bg-[#F7F6F3] text-[#888]",
              )}
            >
              <span
                className={cn(
                  "h-[5px] w-[5px] rounded-full",
                  status === "live" ? "bg-[#1A9E6A] animate-pulse" : "bg-[#AAA49C]",
                )}
              />
              {getStatusLabel(status)}
            </span>
            <span className="rounded-md border border-[#DDD9D1] bg-[#F7F6F3] px-2.5 py-[3px] font-mono text-[11px] font-semibold text-[#111]">
              {meta?.lastPrice ? meta.lastPrice.toFixed(3) : "—"}
            </span>
          </div>
        </div>

        <div className="h-[280px] border-b border-[#EDEAE4] bg-[#FAFAF8] p-2.5 sm:p-3">
          {chartViewport}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="border-b border-[#EDEAE4] px-6 py-3 sm:border-r sm:border-b-0">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[2px] text-[#C0BCB4]">
              Обновлено
            </p>
            <p className="font-mono text-[13px] font-semibold text-[#333]">
              {meta?.updatedAt
                ? new Date(meta.updatedAt).toLocaleTimeString("ru-RU")
                : "Ожидание данных"}
            </p>
          </div>
          <div className="px-6 py-3">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[2px] text-[#C0BCB4]">
              История
            </p>
            <p
              className={cn(
                "font-mono text-[13px] font-semibold",
                meta?.backfillCompleted ? "text-[#1A9E6A]" : "text-[#333]",
              )}
            >
              {meta?.backfillCompleted ? "Синхронизирована" : "Догружается"}
            </p>
          </div>
        </div>

        {(status === "stale" || streamError || meta?.lastErrorMessage) && (
          <p className="border-t border-[#EDEAE4] px-6 py-2.5 text-xs text-amber-600">
            {streamError ??
              meta?.lastErrorMessage ??
              "Источник котировок недоступен, данные временно заморожены"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <PairSelect
            value={selectedSymbol}
            onChange={(next) => {
              resetStreamState();
              setSelectedSymbol(next);
            }}
          />

          <Select
            value={selectedInterval}
            onValueChange={(value) => {
              resetStreamState();
              setSelectedInterval(value as ForexInterval);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Интервал" />
            </SelectTrigger>
            <SelectContent>
              {INTERVAL_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showChartTypeControl && (
            <Select
              value={selectedChartType}
              onValueChange={(value) =>
                setSelectedChartType(value as ForexChartType)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Вид" />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPE_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {meta?.symbol ?? selectedSymbol} · {meta?.interval ?? selectedInterval}
          </Badge>
          <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
          {meta?.lastPrice ? (
            <Badge variant="secondary">Last: {meta.lastPrice.toFixed(3)}</Badge>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border bg-card/60 p-3 sm:p-4">
        {chartViewport}
      </div>

      <div
        className={cn(
          "grid gap-3 text-xs text-muted-foreground",
          showExtendedMeta ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2",
        )}
      >
        <div className="rounded-xl border bg-card/50 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em]">Обновлено</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {meta?.updatedAt
              ? new Date(meta.updatedAt).toLocaleTimeString("ru-RU")
              : "Ожидание данных"}
          </p>
        </div>

        <div className="rounded-xl border bg-card/50 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em]">История</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {meta?.backfillCompleted ? "Синхронизирована" : "Догружается"}
          </p>
        </div>

        {showExtendedMeta && (
          <div className="rounded-xl border bg-card/50 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em]">
              Последний успешный sync
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {meta?.lastSuccessfulSyncAt
                ? new Date(meta.lastSuccessfulSyncAt).toLocaleString("ru-RU")
                : "Пока нет"}
            </p>
          </div>
        )}

        {showExtendedMeta && (
          <div className="rounded-xl border bg-card/50 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em]">Источник</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {meta?.sourceUnavailable
                ? "Показаны последние данные"
                : "Live feed"}
            </p>
          </div>
        )}
      </div>

      {(status === "stale" || streamError || meta?.lastErrorMessage) && (
        <p className="text-sm text-amber-600">
          {streamError ??
            meta?.lastErrorMessage ??
            "Источник котировок недоступен, данные временно заморожены"}
        </p>
      )}
    </div>
  );
}
