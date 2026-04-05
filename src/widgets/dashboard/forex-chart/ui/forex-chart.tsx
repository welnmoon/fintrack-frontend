import { BACKEND_URL } from "@/shared/config/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";

type ForexInterval = "1min" | "5min" | "15min" | "1h" | "4h" | "1day";

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

const SYMBOL_OPTIONS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/KZT",
  "EUR/KZT",
] as const;
type SymbolType = (typeof SYMBOL_OPTIONS)[number];

type Props = {
  symbol?: SymbolType;
  interval?: ForexInterval;
};

const INTERVAL_OPTIONS: ForexInterval[] = [
  "1min",
  "5min",
  "15min",
  "1h",
  "4h",
  "1day",
];

export default function PriceChart({
  symbol = "USD/KZT",
  interval = "15min",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const [data, setData] = useState<AreaData<Time>[]>([]);
  const [status, setStatus] = useState<
    "connecting" | "live" | "stale" | "error"
  >("connecting");
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolType>(symbol);
  const [selectedInterval, setSelectedInterval] =
    useState<ForexInterval>(interval);
  const [streamError, setStreamError] = useState<string | null>(null);

  const [meta, setMeta] = useState<Pick<
    ForexSseSnapshot,
    | "symbol"
    | "interval"
    | "updatedAt"
    | "sourceUnavailable"
    | "backfillCompleted"
    | "lastSuccessfulSyncAt"
    | "lastFailedSyncAt"
    | "lastErrorMessage"
  > | null>(null);

  useEffect(() => {
    const url = new URL(`${BACKEND_URL}/forex/stream`);
    url.searchParams.set("symbol", selectedSymbol);
    url.searchParams.set("interval", selectedInterval);

    setStatus("connecting");
    setStreamError(null);
    setMeta(null);

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    });

    const applyPayload = (payload: ForexSseSnapshot) => {
      const nextData: AreaData<Time>[] = payload.candles.map((candle) => ({
        time: candle.time as Time,
        value: candle.close,
      }));

      setData(nextData);
      setMeta({
        symbol: payload.symbol,
        interval: payload.interval,
        updatedAt: payload.updatedAt,
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
    if (!containerRef.current) return;

    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#222",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#eee" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#2962FF",
      topColor: "rgba(41, 98, 255, 0.4)",
      bottomColor: "rgba(41, 98, 255, 0.0)",
    });

    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;

    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedSymbol}
          onValueChange={(value) => setSelectedSymbol(value as SymbolType)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Пара" />
          </SelectTrigger>
          <SelectContent>
            {SYMBOL_OPTIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedInterval}
          onValueChange={(value) => setSelectedInterval(value as ForexInterval)}
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
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {meta?.symbol ?? selectedSymbol} · {meta?.interval ?? selectedInterval}
        </span>
        <span>
          {status === "live"
            ? "SSE live"
            : status === "stale"
              ? "Источник недоступен, показаны последние данные"
              : status === "connecting"
                ? "Подключение..."
                : "Поток недоступен"}
        </span>
      </div>

      <div ref={containerRef} style={{ width: "100%" }} />

      {meta?.updatedAt ? (
        <p className="text-xs text-muted-foreground">
          Обновлено: {new Date(meta.updatedAt).toLocaleTimeString("ru-RU")}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        История: {meta?.backfillCompleted ? "синхронизирована" : "догружается"}
      </p>

      {meta?.lastSuccessfulSyncAt ? (
        <p className="text-xs text-muted-foreground">
          Последний успешный sync: {new Date(meta.lastSuccessfulSyncAt).toLocaleString("ru-RU")}
        </p>
      ) : null}

      {(status === "stale" || streamError || meta?.lastErrorMessage) && (
        <p className="text-xs text-amber-600">
          {streamError ??
            meta?.lastErrorMessage ??
            "Источник котировок недоступен, данные временно заморожены"}
        </p>
      )}
    </div>
  );
}
