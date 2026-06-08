import { useGetForexPairs } from "@/entities/forex/api/use-get-forex-pairs";
import Marquee from "react-fast-marquee";
import PriceChart from "@/widgets/dashboard/forex-chart/ui/forex-chart";

function formatTickerPrice(value: number) {
  if (value >= 1000) {
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatTickerChange(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function ForexPairsTicker() {
  const { data } = useGetForexPairs();
  const items = data ?? [];

  if (!items.length) return null;

  return (
    <div
      className="flex h-[34px] items-center overflow-hidden border-b border-[#d9e6dd] bg-[rgba(255,255,255,.92)] backdrop-blur-md"
      role="presentation"
    >
      <Marquee
        autoFill
        pauseOnHover
        gradient={false}
        speed={34}
        className="whitespace-nowrap px-6"
      >
        <div className="flex items-center gap-[56px] pr-[56px]">
          {items.map((item) => {
            const isUp = (item.changePercent ?? 0) >= 0;

            return (
              <span
                key={`${item.symbol}-${item.interval}`}
                className="flex items-center gap-2"
              >
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10.5,
                    color: "rgba(13,31,22,.5)",
                  }}
                >
                  {item.symbol}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#0d1f16",
                  }}
                >
                  {formatTickerPrice(item.lastPrice)}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10.5,
                    color:
                      item.changePercent === null
                        ? "rgba(13,31,22,.42)"
                        : isUp
                          ? "#1e7a4a"
                          : "#d93025",
                  }}
                >
                  {formatTickerChange(item.changePercent)}
                </span>
              </span>
            );
          })}
        </div>
      </Marquee>
    </div>
  );
}

export function ForexPage() {
  return (
    <div
      className="-mx-4 -my-6 flex flex-col overflow-hidden sm:-mx-6 lg:-mx-8 lg:-my-8"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <ForexPairsTicker />
      <PriceChart
        variant="page"
        showChartTypeControl
        showExtendedMeta
        className="min-h-0 flex-1"
      />
    </div>
  );
}
