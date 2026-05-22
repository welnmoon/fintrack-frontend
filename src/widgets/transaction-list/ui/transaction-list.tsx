import { useState } from "react";
import type { GetAccountOptions } from "@/entities/account/model/types.api";
import type { Transaction, TransactionEmotion } from "@/entities/transaction/model/types";
import { displayCategoryName } from "@/shared/lib/category/display-category-name";
import { Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib";

/* ─── Account mini-card background colors ─── */
const ACCOUNT_BG: Record<string, string> = {
  "aurora-teal": "#0F9480",
  "midnight-indigo": "#3840A8",
  "sunset-coral": "#C03828",
  "emerald-lagoon": "#2A8A5A",
  "amber-ember": "#C8780A",
  "ocean-breeze": "#2870A8",
  "graphite-gold": "#706848",
  "rose-dusk": "#A03060",
  "frost-blue": "#4888C8",
  "forest-mint": "#2A8A4A",
};

function accountColor(backgroundKey?: string | null): string {
  return ACCOUNT_BG[backgroundKey ?? ""] ?? "#6A6860";
}

/* ─── MiniCard ─── */
function MiniCard({
  backgroundKey,
  small,
}: {
  backgroundKey?: string | null;
  small?: boolean;
}) {
  const bg = accountColor(backgroundKey);
  const size = small ? "h-[13px] w-[20px] rounded-[2.5px]" : "h-[15px] w-[24px] rounded-[3px]";
  return (
    <span
      className={cn("relative flex-shrink-0", size)}
      style={{ backgroundColor: bg }}
    >
      <span
        className="absolute rounded-[1px]"
        style={{
          top: small ? 3 : 4,
          left: small ? 3 : 4,
          width: small ? 6 : 7,
          height: small ? 4 : 5,
          background: "rgba(255,255,255,0.35)",
        }}
      />
    </span>
  );
}

/* ─── Category icon box ─── */
type CatCfg = { bg: string; color: string; icon: React.ReactNode };

const BillsIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const ShoppingIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2.5 7h11l-1.2 7h-8.6L2.5 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);
const FoodIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <path d="M5 2v5a2 2 0 0 0 4 0V2M7 7v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M11 2a3 3 0 0 1 1.5 2.5V7h-3V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 7v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const TransportIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <path d="M2 9l1.5-4h9L14 9M2 9h12v3.5H2V9Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="4.5" cy="13" r="1" fill="currentColor" />
    <circle cx="11.5" cy="13" r="1" fill="currentColor" />
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <path d="M2 7L8 2l6 5v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6 14v-5h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HealthIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <path d="M8 13.5C8 13.5 2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);
const EntertainmentIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6.5 5.5l5 2.5-5 2.5V5.5Z" fill="currentColor" />
  </svg>
);
const TravelIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <path d="M2 13.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M5 10V6a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M3 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IncomeArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <path d="M8 12V4M5 7l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const GenericIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

function catConfig(iconKey: string | null | undefined, isIncome: boolean): CatCfg {
  if (isIncome) return { bg: "#E0F0E4", color: "#1A7030", icon: <IncomeArrowIcon /> };
  switch (iconKey) {
    case "bills":
    case "subscriptions":
      return { bg: "#EBF1F9", color: "#3060A8", icon: <BillsIcon /> };
    case "shopping":
      return { bg: "#F2EDFC", color: "#6B3DB0", icon: <ShoppingIcon /> };
    case "food":
      return { bg: "#E8F5EC", color: "#2A7A40", icon: <FoodIcon /> };
    case "transport":
      return { bg: "#F0EEE8", color: "#6A6860", icon: <TransportIcon /> };
    case "home":
      return { bg: "#EBF4F9", color: "#2870A8", icon: <HomeIcon /> };
    case "health":
      return { bg: "#FCE8EC", color: "#A03048", icon: <HealthIcon /> };
    case "entertainment":
      return { bg: "#FEF5E0", color: "#8A5A08", icon: <EntertainmentIcon /> };
    case "travel":
      return { bg: "#E8F5EC", color: "#2A7040", icon: <TravelIcon /> };
    default:
      return { bg: "#F0EEE8", color: "#6A6860", icon: <GenericIcon /> };
  }
}

/* ─── Emotion row chip ─── */
const EMO_ROW: Record<TransactionEmotion, { bg: string; icon: React.ReactNode }> = {
  IMPULSIVE: {
    bg: "#FEF0D0",
    icon: (
      <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
        <path d="M6 1L3 5.5h2.5L5 9 8 4.5H5.5L6 1Z" fill="#C8780A" />
      </svg>
    ),
  },
  REGRET: {
    bg: "#EFE8FA",
    icon: (
      <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
        <path d="M4.5 3L3 4.5l1.5 1.5" stroke="#7C4ABF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 4.5h3.5a2 2 0 0 1 0 4H5.5" stroke="#7C4ABF" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  HAPPY: {
    bg: "#E0F0E4",
    icon: (
      <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
        <circle cx="5" cy="5" r="3.5" stroke="#3A9A52" strokeWidth="1.1" />
        <circle cx="3.7" cy="4.2" r="0.45" fill="#3A9A52" />
        <circle cx="6.3" cy="4.2" r="0.45" fill="#3A9A52" />
        <path d="M3.2 6.2c.4.9 3.2.9 3.6 0" stroke="#3A9A52" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  NEUTRAL: {
    bg: "#EEECE8",
    icon: (
      <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
        <circle cx="5" cy="5" r="3.5" stroke="#8A8880" strokeWidth="1.1" />
        <path d="M3 5.5h4" stroke="#8A8880" strokeWidth="1" strokeLinecap="round" />
        <circle cx="3.7" cy="4" r="0.45" fill="#8A8880" />
        <circle cx="6.3" cy="4" r="0.45" fill="#8A8880" />
      </svg>
    ),
  },
  STRESS: {
    bg: "#F7ECEC",
    icon: (
      <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
        <path d="M1 5.5L2.5 3l1.5 3 2-4 1.5 4 1.5-2.5" stroke="#C53030" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

/* ─── Emotion detail pill ─── */
const EMO_DETAIL: Record<
  TransactionEmotion,
  { bg: string; color: string; label: string; icon: React.ReactNode }
> = {
  IMPULSIVE: {
    bg: "#FEF0D0", color: "#8A5A08", label: "Импульсивно",
    icon: <svg viewBox="0 0 10 10" fill="none" className="h-[9px] w-[9px]"><path d="M6 1L3 5.5h2.5L5 9 8 4.5H5.5L6 1Z" fill="#C8780A" /></svg>,
  },
  REGRET: {
    bg: "#EFE8FA", color: "#5A2E9A", label: "Сожаление",
    icon: <svg viewBox="0 0 10 10" fill="none" className="h-[9px] w-[9px]"><path d="M4.5 3L3 4.5l1.5 1.5" stroke="#7C4ABF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 4.5h3.5a2 2 0 0 1 0 4H5.5" stroke="#7C4ABF" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  },
  HAPPY: {
    bg: "#E0F0E4", color: "#1A7030", label: "Хорошее",
    icon: <svg viewBox="0 0 10 10" fill="none" className="h-[9px] w-[9px]"><circle cx="5" cy="5" r="3.5" stroke="#3A9A52" strokeWidth="1.1" /><circle cx="3.7" cy="4.2" r="0.45" fill="#3A9A52" /><circle cx="6.3" cy="4.2" r="0.45" fill="#3A9A52" /><path d="M3.2 6.2c.4.9 3.2.9 3.6 0" stroke="#3A9A52" strokeWidth="1" strokeLinecap="round" /></svg>,
  },
  NEUTRAL: {
    bg: "#EEECE8", color: "#6A6860", label: "Нейтрально",
    icon: <svg viewBox="0 0 10 10" fill="none" className="h-[9px] w-[9px]"><circle cx="5" cy="5" r="3.5" stroke="#8A8880" strokeWidth="1.1" /><path d="M3 5.5h4" stroke="#8A8880" strokeWidth="1" strokeLinecap="round" /></svg>,
  },
  STRESS: {
    bg: "#F7ECEC", color: "#A03030", label: "Стресс",
    icon: <svg viewBox="0 0 10 10" fill="none" className="h-[9px] w-[9px]"><path d="M1 5.5L2.5 3l1.5 3 2-4 1.5 4 1.5-2.5" stroke="#C53030" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
};

/* ─── Helpers ─── */
function fmtRow(amount: number, currency: string): string {
  return `${Math.round(Number(amount)).toLocaleString("ru-RU")} ${currency}`;
}

function fmtDetail(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function txWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "операция";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "операции";
  return "операций";
}

function dayWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "день";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "дня";
  return "дней";
}

function groupByDate(txs: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  const sorted = [...txs].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );
  for (const tx of sorted) {
    const key = tx.occurredAt.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    label: items[0].occurredAt
      .toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(" г.", ""),
    items,
  }));
}

/* ─── Transaction row ─── */
function TxRow({
  tx,
  account,
  isOpen,
  onToggle,
}: {
  tx: Transaction;
  account?: GetAccountOptions;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isIncome = tx.type === "INCOME";
  const cfg = catConfig(tx.category?.icon, isIncome);
  const cur = account?.currency ?? tx.account.currency;
  const emo = tx.emotion ? EMO_ROW[tx.emotion] : null;
  const emoDetail = tx.emotion ? EMO_DETAIL[tx.emotion] : null;
  const dateStr = tx.occurredAt
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(" г.", "");
  const timeStr = tx.occurredAt.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border-t border-[#F5F3EE] first:border-t-0">
      {/* Row */}
      <div
        className={cn(
          "flex h-10 cursor-pointer select-none items-center gap-[7px] px-5 transition-colors hover:bg-[#FAFAF7]",
          isOpen && "bg-[#FAFAF5]",
        )}
        onClick={onToggle}
      >
        {/* Category icon */}
        <span
          className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[7px]"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.icon}
        </span>

        {/* Emotion chip */}
        {emo && (
          <span
            className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px]"
            style={{ background: emo.bg }}
          >
            {emo.icon}
          </span>
        )}

        {/* Note preview */}
        {tx.note ? (
          <span className="max-w-[160px] min-w-0 flex-shrink overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-[#B8B5AC]">
            {tx.note}
          </span>
        ) : null}

        <span className="min-w-[8px] flex-1" />

        {/* Account minicard */}
        <MiniCard backgroundKey={account?.backgroundKey} />

        {/* Amount */}
        <span
          className={cn(
            "min-w-[108px] whitespace-nowrap text-right font-mono text-[13.5px] font-medium",
            isIncome ? "text-[#2A8A42]" : "text-[#2A2A26]",
          )}
        >
          {isIncome ? "+" : "−"}
          {fmtRow(tx.amount, cur)}
        </span>

        {/* Chevron */}
        <span
          className={cn(
            "flex h-4 w-4 flex-shrink-0 items-center justify-center text-[#D0CCC4] transition-all duration-[220ms]",
            isOpen && "rotate-180 text-[#9A9890]",
          )}
        >
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Accordion detail */}
      <div
        className="overflow-hidden bg-[#FAFAF7] transition-all duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ maxHeight: isOpen ? "300px" : 0 }}
      >
        <div
          className="grid gap-x-4 gap-y-2.5 border-t border-[#F0EDE5] px-5 py-3.5"
          style={{
            paddingLeft: "calc(1.25rem + 26px + 7px)",
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          {/* Date + time */}
          <div>
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-[#C0BDB4]">
              Дата и время
            </p>
            <p className="text-[12.5px] text-[#4A4944]">
              {dateStr}, {timeStr}
            </p>
          </div>

          {/* Account */}
          <div>
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-[#C0BDB4]">
              Счёт
            </p>
            <div className="flex items-center gap-1.5">
              <MiniCard backgroundKey={account?.backgroundKey} small />
              <p className="text-[12.5px] text-[#4A4944]">
                {account?.name ?? "—"}
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-[#C0BDB4]">
              Категория
            </p>
            <p className="text-[12.5px] text-[#4A4944]">
              {tx.category ? displayCategoryName(tx.category.name) : "—"}
            </p>
          </div>

          {/* Note */}
          <div>
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-[#C0BDB4]">
              Комментарий
            </p>
            <p
              className={cn(
                "text-[12.5px]",
                tx.note ? "text-[#4A4944]" : "text-[#C0BDB4]",
              )}
            >
              {tx.note ?? "Без комментария"}
            </p>
          </div>

          {/* Emotion */}
          <div>
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-[#C0BDB4]">
              Эмоция
            </p>
            {emoDetail ? (
              <span
                className="inline-flex items-center gap-1 rounded-[4px] px-[7px] py-[2px] text-[12px]"
                style={{ background: emoDetail.bg, color: emoDetail.color }}
              >
                {emoDetail.icon}
                {emoDetail.label}
              </span>
            ) : (
              <p className="text-[12.5px] text-[#C0BDB4]">—</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-[#C0BDB4]">
              Сумма
            </p>
            <p
              className={cn(
                "font-mono text-[12px]",
                isIncome ? "text-[#2A8A42]" : "text-[#4A4944]",
              )}
            >
              {isIncome ? "+" : "−"}
              {fmtDetail(tx.amount, cur)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Date group ─── */
function DateGroup({
  label,
  items,
  accountById,
  openId,
  setOpenId,
}: {
  label: string;
  items: Transaction[];
  accountById: Map<string, GetAccountOptions>;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const daily = items.reduce((sum, tx) => {
    if (tx.type === "INCOME") return sum + Number(tx.amount);
    if (tx.type === "EXPENSE") return sum - Number(tx.amount);
    return sum;
  }, 0);

  const cur = items[0]?.account.currency ?? "KZT";
  const isPositive = daily >= 0;

  return (
    <div>
      {/* Date header */}
      <div className="flex items-center gap-2 px-5 pb-[3px] pt-[7px]">
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C0BDB4]">
          {label}
        </span>
        <span className="h-px flex-1 bg-[#F0EDE5]" />
        <span
          className={cn(
            "font-mono text-[11px]",
            isPositive ? "text-[#7ABB8A]" : "text-[#C8C5BC]",
          )}
        >
          {isPositive ? "+" : "−"}
          {Math.abs(Math.round(daily)).toLocaleString("ru-RU")} {cur}
        </span>
      </div>

      {/* Rows */}
      {items.map((tx) => (
        <TxRow
          key={tx.id}
          tx={tx}
          account={accountById.get(tx.accountId)}
          isOpen={openId === tx.id}
          onToggle={() => setOpenId(openId === tx.id ? null : tx.id)}
        />
      ))}
    </div>
  );
}

/* ─── Props ─── */
export type TransactionListProps = {
  transactions?: Transaction[];
  accountById?: Map<string, GetAccountOptions>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyLabel?: string;
};

/* ─── Main component ─── */
export function TransactionList({
  transactions,
  accountById = new Map(),
  isLoading = false,
  isError = false,
  errorMessage,
  emptyLabel = "Пока нет операций",
}: TransactionListProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  /* Monthly summary */
  const totalIncome = (transactions ?? [])
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = (transactions ?? [])
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Number(t.amount), 0);
  const net = totalIncome - totalExpense;
  const currency =
    (transactions ?? []).find(() => true)?.account.currency ?? "KZT";

  /* Period label */
  const sorted = [...(transactions ?? [])].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );
  const latestTx = sorted[0];
  const periodLabel = latestTx
    ? latestTx.occurredAt
        .toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
        .replace(" г.", "")
    : "Текущий период";

  /* Accounts for legend */
  const legendAccounts = [...accountById.values()].slice(0, 5);

  /* Date groups */
  const groups = groupByDate(transactions ?? []);

  /* Footer stats */
  const uniqueDays = new Set(
    (transactions ?? []).map((t) => t.occurredAt.toISOString().slice(0, 10)),
  ).size;
  const txCount = (transactions ?? []).length;

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#E5E2D8] bg-white">
      {/* Monthly summary */}
      <div className="flex flex-wrap items-center gap-0 border-b border-[#E5E2D8] bg-[#FAFAF7] px-5 py-3.5">
        <span className="min-w-[80px] text-[13px] font-semibold text-[#1C1B18]">
          {isLoading ? <Skeleton className="h-4 w-20" /> : periodLabel}
        </span>
        <div className="flex flex-1 flex-wrap">
          {/* Income */}
          <div className="flex-1 border-l border-[#E5E2D8] px-4">
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C0BDB4]">
              Доход
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <p className="font-mono text-[15px] font-medium tracking-[-0.02em] text-[#2A8A42]">
                +{fmtRow(totalIncome, currency)}
              </p>
            )}
          </div>
          {/* Expense */}
          <div className="flex-1 border-l border-[#E5E2D8] px-4">
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C0BDB4]">
              Расход
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <p className="font-mono text-[15px] font-medium tracking-[-0.02em] text-[#1C1B18]">
                −{fmtRow(totalExpense, currency)}
              </p>
            )}
          </div>
          {/* Net */}
          <div className="flex-1 border-l border-[#E5E2D8] px-4">
            <p className="mb-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C0BDB4]">
              Итог
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <p
                className={cn(
                  "font-mono text-[15px] font-medium tracking-[-0.02em]",
                  net >= 0 ? "text-[#2A8A42]" : "text-[#B83030]",
                )}
              >
                {net >= 0 ? "+" : "−"}
                {fmtRow(Math.abs(net), currency)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* List header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D8] px-5 py-2.5">
        <span className="text-[13px] font-semibold text-[#1C1B18]">
          Транзакции
        </span>
        {legendAccounts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {legendAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center gap-[5px]"
                title={acc.name}
              >
                <MiniCard backgroundKey={acc.backgroundKey} />
                <span className="hidden text-[11px] text-[#B0ADA4] sm:inline">
                  {acc.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex h-10 items-center gap-3 border-t border-[#F5F3EE] px-5 first:border-t-0"
            >
              <Skeleton className="h-[26px] w-[26px] flex-shrink-0 rounded-[7px]" />
              <Skeleton className="h-3 w-24" />
              <div className="flex-1" />
              <Skeleton className="h-3 w-16 rounded-[3px]" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="px-5 py-10 text-center text-[13px] text-[#C0BDB4]">
          Ошибка загрузки{errorMessage ? `: ${errorMessage}` : ""}
        </div>
      ) : !transactions?.length ? (
        <div className="px-5 py-10 text-center text-[13px] text-[#C0BDB4]">
          {emptyLabel}
        </div>
      ) : (
        groups.map((g) => (
          <DateGroup
            key={g.key}
            label={g.label}
            items={g.items}
            accountById={accountById}
            openId={openId}
            setOpenId={setOpenId}
          />
        ))
      )}

      {/* Footer */}
      {!isLoading && txCount > 0 && (
        <div className="flex items-center justify-between border-t border-[#E5E2D8] px-5 py-2.5">
          <span className="text-[11px] text-[#C0BDB4]">
            {txCount} {txWord(txCount)} · {uniqueDays} {dayWord(uniqueDays)}
          </span>
          <span className="font-mono text-[13px] font-medium text-[#1C1B18]">
            Итог: {net >= 0 ? "+" : "−"}
            {fmtRow(Math.abs(net), currency)}
          </span>
        </div>
      )}
    </div>
  );
}
