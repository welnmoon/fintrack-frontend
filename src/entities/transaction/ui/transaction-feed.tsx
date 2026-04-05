import type { GetAccountOptions } from "@/entities/account/model/types.api";
import { createElement } from "react";
import {
  CircleDollarSign,
  CreditCard,
  MessageSquareText,
  Tag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { DEFAULT_CATEGORY_COLOR } from "@/shared/const/category";
import { formatCurrency, formatDate } from "@/shared/lib";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";
import { Badge, Card, CardContent, Skeleton } from "@/shared/ui";
import type { Transaction } from "../model/types";
import { EmotionBadge } from "./emotion-badge";

type TransactionFeedProps = {
  transactions?: Transaction[];
  accountById?: Map<string, GetAccountOptions>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyLabel?: string;
};

function resolveCategoryColor(colorKey: string | null | undefined): string {
  if (!colorKey) return DEFAULT_CATEGORY_COLOR;

  try {
    return getCategoryColor(colorKey as CategoryColorKey);
  } catch {
    return DEFAULT_CATEGORY_COLOR;
  }
}

function resolveCategoryIcon(iconKey: string | null | undefined): LucideIcon {
  if (!iconKey) return Tag;

  try {
    return getCategoryIcon(iconKey as CategoryIconKey) ?? Tag;
  } catch {
    return Tag;
  }
}

function TransactionFeedItem({
  transaction,
  account,
}: {
  transaction: Transaction;
  account?: GetAccountOptions;
}) {
  const categoryColor = resolveCategoryColor(transaction.category?.color);
  const AccountIcon = account?.type === "BANK" ? CreditCard : CircleDollarSign;

  return (
    <div className="rounded-2xl border bg-card/70 p-4 transition-colors hover:bg-muted/20">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-muted/50 px-3 py-1.5 text-sm font-medium">
            {formatDate(transaction.occurredAt)}
          </div>

          <Badge
            variant="outline"
            className="gap-2 rounded-full border-border/70 bg-background/80 px-3 py-1.5"
          >
            {createElement(resolveCategoryIcon(transaction.category?.icon), {
              className: "h-3.5 w-3.5 shrink-0",
              style: { color: categoryColor },
            })}
            <span>{transaction.category?.name ?? "Без категории"}</span>
          </Badge>

          {transaction.emotion && <EmotionBadge emotion={transaction.emotion} />}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_auto] lg:items-center">
          <div className="min-w-0 rounded-2xl border border-dashed border-border/70 bg-background/60 px-3 py-3">
            <div className="flex items-start gap-2">
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Комментарий
                </p>
                <p className="mt-1 break-words text-sm text-foreground">
                  {transaction.note?.trim() || "Без комментария"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/75 text-muted-foreground">
                <AccountIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Счет
                </p>
                <p className="mt-1 truncate text-sm font-medium">
                  {account?.name ?? transaction.accountId}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                {account?.currency ?? transaction.account.currency}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-primary/[0.05] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-semibold tracking-tight">
                {formatCurrency(transaction.amount, transaction.account.currency)}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                <span>
                  {transaction.type === "EXPENSE"
                    ? "Расход"
                    : transaction.type === "INCOME"
                      ? "Доход"
                      : "Корректировка"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionFeedSkeleton() {
  return (
    <div className="rounded-2xl border bg-card/70 p-4">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-40 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_auto]">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function TransactionFeed({
  transactions,
  accountById,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyLabel = "Пока нет операций",
}: TransactionFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <TransactionFeedSkeleton />
        <TransactionFeedSkeleton />
        <TransactionFeedSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          Ошибка загрузки: {errorMessage ?? "Неизвестная ошибка"}
        </CardContent>
      </Card>
    );
  }

  if (!transactions?.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionFeedItem
          key={transaction.id}
          transaction={transaction}
          account={accountById?.get(transaction.accountId)}
        />
      ))}
    </div>
  );
}
