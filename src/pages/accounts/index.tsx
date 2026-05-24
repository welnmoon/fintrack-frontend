import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useGetAccounts } from "@/entities/account/api/use-get-accounts";
import {
  ACCOUNT_BACKGROUND_OPTIONS,
  DEFAULT_ACCOUNT_BACKGROUND_KEY,
  getAccountBackgroundClassName,
  type AccountBackgroundKey,
} from "@/entities/account/lib/account-backgrounds";
import type { GetAccount } from "@/entities/account/model/types.api";
import { AccountActionsMenu } from "@/features/accounts/account-actions/ui/account-actions-menu";
import { useCreateAccount } from "@/features/accounts/create-account/api/use-create-accoun";
import {
  createAccountSchema,
  type CreateAccountSchemaInput,
} from "@/features/accounts/create-account/model/schema";
import { cn } from "@/shared/lib";
import { Skeleton } from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

/* ─── Background solid colour for legend & distribution bar ─── */
const BG_SOLID: Record<string, string> = {
  "aurora-teal": "#1d4ed8",
  "midnight-indigo": "#4f46e5",
  "sunset-coral": "#ea580c",
  "emerald-lagoon": "#0f766e",
  "amber-ember": "#d97706",
  "ocean-breeze": "#0284c7",
  "graphite-gold": "#374151",
  "rose-dusk": "#9d174d",
  "frost-blue": "#2563eb",
  "forest-mint": "#15803d",
};

function bgColor(key?: string | null) {
  return BG_SOLID[key ?? ""] ?? "#6b7280";
}

/* ─── Helpers ─── */
function fmtBalance(amount: number): string {
  return Number(amount).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function accountWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "счёт";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100))
    return "счёта";
  return "счетов";
}

/* ─── Chip decoration ─── */
function ChipDecoration() {
  return (
    <div
      className="absolute left-5 top-1/2 -translate-y-1/2 rounded-[4px] border border-white/20 bg-white/25"
      style={{
        width: 28,
        height: 22,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        gap: 2,
        padding: 4,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[1px] bg-white/30" />
      ))}
    </div>
  );
}

/* ─── Summary card ─── */
function SummaryCard({ accounts }: { accounts: GetAccount[] }) {
  const total = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const currency = accounts[0]?.currency ?? "KZT";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E2D8] bg-white px-6 py-5">
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C0BDB4]">
          Итого
        </span>
        <span className="font-mono text-[26px] font-normal tracking-[-0.03em] text-[#1C1B18]">
          {fmtBalance(total)} {currency}
        </span>
        <span className="ml-auto text-[13px] text-[#B0ADA4]">
          {accounts.length} {accountWord(accounts.length)} · {currency}
        </span>
      </div>

      {/* Distribution bar */}
      <div className="mb-2 flex h-[7px] gap-[2px] overflow-hidden rounded-full">
        {accounts.map((a, i) => {
          const pct = total > 0 ? (Number(a.balance) / total) * 100 : 0;
          const isFirst = i === 0;
          const isLast = i === accounts.length - 1;
          return (
            <div
              key={a.id}
              className="h-full transition-[width] duration-500"
              style={{
                width: `${pct}%`,
                minWidth: pct > 0 ? 3 : 0,
                background: bgColor(a.backgroundKey),
                borderRadius: isFirst
                  ? "4px 2px 2px 4px"
                  : isLast
                    ? "2px 4px 4px 2px"
                    : "2px",
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center gap-1.5 text-[11px] text-[#B0ADA4]">
            <span
              className="h-2 w-2 flex-shrink-0 rounded-[2px]"
              style={{ background: bgColor(a.backgroundKey) }}
            />
            {a.name} · {fmtBalance(Number(a.balance))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Account card ─── */
function AccountCard({
  account,
  accounts,
}: {
  account: GetAccount;
  accounts: GetAccount[];
}) {
  return (
    <div
      className={cn(
        "account-bg relative flex aspect-[1.68] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-5 text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-2xl",
        getAccountBackgroundClassName(account.backgroundKey),
      )}
    >
      {/* Top */}
      <div className="relative z-10 flex items-start justify-between">
        <span className="rounded-[5px] bg-white/20 px-2 py-[3px] text-[10px] font-bold tracking-[0.1em] backdrop-blur-sm">
          {account.type}
        </span>
        <AccountActionsMenu account={account} accounts={accounts} />
      </div>

      {/* Chip */}
      <ChipDecoration />

      {/* Bottom */}
      <div className="relative z-10">
        <p className="text-[16px] font-semibold leading-tight">{account.name}</p>
        <p className="mb-1.5 font-mono text-[10px] opacity-60">
          {account.accountNumber ?? "—"}
        </p>
        <p className="font-mono text-[20px] font-medium leading-none tracking-[-0.02em]">
          {fmtBalance(Number(account.balance))}
        </p>
        <p className="mt-[3px] text-[12px] opacity-65">{account.currency}</p>
      </div>
    </div>
  );
}

/* ─── Add card slot ─── */
function AddCardSlot({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex aspect-[1.68] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D8D5CC] bg-transparent text-[#B8B5AC] transition-colors hover:border-[#B0ADA4] hover:bg-white/60 hover:text-[#6A6860]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-current transition-transform hover:scale-105">
        <svg viewBox="0 0 18 18" fill="none" className="h-[18px] w-[18px]">
          <path
            d="M9 3v12M3 9h12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-[13px] font-medium">Добавить счёт</span>
    </button>
  );
}

/* ─── Gradient picker option ─── */
function GradientOption({
  option,
  selected,
  onSelect,
}: {
  option: (typeof ACCOUNT_BACKGROUND_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "account-bg relative aspect-[1.68] w-full overflow-hidden rounded-lg border-2 transition-transform hover:scale-105",
          getAccountBackgroundClassName(option.value),
          selected ? "border-[#1C1B18]" : "border-transparent",
        )}
        style={selected ? { boxShadow: "0 0 0 2px #fff inset" } : undefined}
      >
        {selected && (
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white">
            ✓
          </span>
        )}
      </button>
      <p className="mt-1 truncate text-center text-[10px] text-[#B0ADA4]">
        {option.label}
      </p>
    </div>
  );
}

/* ─── Create account modal ─── */
const accountTypeOptions = [
  { value: "BANK" as const, label: "Банковский (BANK)" },
  { value: "CASH" as const, label: "Наличные (CASH)" },
] as const;

const currencyOptions = [
  { value: "KZT" as const, label: "KZT — Тенге" },
  { value: "USD" as const, label: "USD — Доллар" },
  { value: "EUR" as const, label: "EUR — Евро" },
] as const;

function CreateAccountModal({
  open,
  onClose,
  accountCount,
}: {
  open: boolean;
  onClose: () => void;
  accountCount: number;
}) {
  const MAX = 5;
  const hasReachedLimit = accountCount >= MAX;

  const form = useForm<CreateAccountSchemaInput>({
    defaultValues: {
      name: "",
      type: "BANK",
      currency: "KZT",
      backgroundKey: DEFAULT_ACCOUNT_BACKGROUND_KEY,
    },
    resolver: zodResolver(createAccountSchema),
    mode: "onChange",
  });

  const { mutate, isPending, error } = useCreateAccount();

  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedType = useWatch({ control: form.control, name: "type" });
  const watchedCurrency = useWatch({ control: form.control, name: "currency" });
  const watchedBg = useWatch({ control: form.control, name: "backgroundKey" });

  const onSubmit = (values: CreateAccountSchemaInput) => {
    if (hasReachedLimit) return;
    mutate(createAccountSchema.parse(values), {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(20,20,18,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
        style={{ transform: "scale(1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E2D8] px-6 py-[22px]">
          <span className="text-[16px] font-semibold text-[#1C1B18]">
            Новый счёт
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#F2F0EA] text-[#6A6860] transition-colors hover:bg-[#E8E5DC]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Live preview */}
        <div className="flex justify-center border-b border-[#E5E2D8] bg-[#F8F7F3] px-6 py-5">
          <div
            className={cn(
              "account-bg relative flex w-[200px] flex-col justify-between overflow-hidden rounded-xl p-[14px] text-white shadow-xl",
              "aspect-[1.68]",
              getAccountBackgroundClassName(
                watchedBg ?? DEFAULT_ACCOUNT_BACKGROUND_KEY,
              ),
            )}
          >
            <div className="relative z-10 flex items-start justify-between">
              <span className="text-[10px] font-bold tracking-[0.08em] opacity-75">
                {watchedType ?? "BANK"}
              </span>
              <span className="text-[11px] opacity-65">
                {watchedCurrency ?? "KZT"}
              </span>
            </div>
            <div className="relative z-10">
              <p className="font-mono text-[18px] font-medium opacity-50">
                0,00
              </p>
              <p className="text-[13px] font-semibold leading-tight">
                {watchedName?.trim() || "Название счёта"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#B0ADA4]">
                Название
              </label>
              <input
                {...form.register("name")}
                type="text"
                placeholder="Например: Kaspi Gold"
                className="w-full rounded-[9px] border-[1.5px] border-[#E5E2D8] px-3 py-2.5 text-[14px] text-[#1C1B18] outline-none transition-colors placeholder:text-[#C8C5BC] focus:border-[#A09E96]"
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-[12px] text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Type + Currency */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#B0ADA4]">
                  Тип
                </label>
                <Controller
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full appearance-none rounded-[9px] border-[1.5px] border-[#E5E2D8] bg-white px-3 py-2.5 text-[14px] text-[#1C1B18] outline-none transition-colors focus:border-[#A09E96]"
                    >
                      {accountTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#B0ADA4]">
                  Валюта
                </label>
                <Controller
                  name="currency"
                  control={form.control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full appearance-none rounded-[9px] border-[1.5px] border-[#E5E2D8] bg-white px-3 py-2.5 text-[14px] text-[#1C1B18] outline-none transition-colors focus:border-[#A09E96]"
                    >
                      {currencyOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Background picker */}
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#B0ADA4]">
                Фон карты
              </label>
              <Controller
                name="backgroundKey"
                control={form.control}
                render={({ field }) => (
                  <div className="grid grid-cols-5 gap-[7px]">
                    {ACCOUNT_BACKGROUND_OPTIONS.map((opt) => (
                      <GradientOption
                        key={opt.value}
                        option={opt}
                        selected={field.value === opt.value}
                        onSelect={() =>
                          field.onChange(opt.value as AccountBackgroundKey)
                        }
                      />
                    ))}
                  </div>
                )}
              />
            </div>

            {hasReachedLimit && (
              <p className="text-[13px] text-[#A09E96]">
                Достигнут лимит счетов ({MAX}).
              </p>
            )}
            {error instanceof Error && (
              <p className="text-[13px] text-red-500">
                Ошибка создания: {error.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E5E2D8] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[9px] border-[1.5px] border-[#E5E2D8] px-[18px] py-[9px] text-[13px] text-[#7A7971] transition-colors hover:border-[#C8C5BC] hover:bg-[#F5F3EE]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending || hasReachedLimit}
              className="rounded-[9px] bg-[#1C1B18] px-5 py-[9px] text-[13px] font-medium text-[#F5F3EE] transition-colors hover:bg-[#2E2D28] disabled:opacity-50"
            >
              {isPending ? "Создаю..." : "Создать счёт"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Skeleton cards ─── */
function AccountCardSkeleton() {
  return (
    <div className="aspect-[1.68] rounded-2xl bg-[#E5E2D8]">
      <Skeleton className="h-full w-full rounded-2xl" />
    </div>
  );
}

/* ─── Page ─── */
export function AccountsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: accounts, isLoading, isError, error } = useGetAccounts();

  const errorMessage = error instanceof Error ? error.message : "Ошибка";

  return (
    <PageContainer>
      <PageHeader
        title="Счета"
        description="Визуальная структура баланса по счетам."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-[7px] rounded-[10px] bg-[#1C1B18] px-[18px] py-[9px] text-[13px] font-medium text-[#F5F3EE] transition-colors hover:bg-[#2E2D28] active:scale-[0.97]"
          >
            <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5">
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Добавить счёт
          </button>
        }
      />

      {/* Summary */}
      {!isLoading && !isError && accounts && accounts.length > 0 && (
        <SummaryCard accounts={accounts} />
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <AccountCardSkeleton key={i} />
          ))}

        {isError && (
          <p className="col-span-full text-sm text-red-500">
            Ошибка загрузки: {errorMessage}
          </p>
        )}

        {!isLoading &&
          !isError &&
          accounts &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} accounts={accounts} />
          ))}

        {!isLoading && !isError && (
          <AddCardSlot onAdd={() => setModalOpen(true)} />
        )}
      </div>

      <CreateAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        accountCount={accounts?.length ?? 0}
      />
    </PageContainer>
  );
}
