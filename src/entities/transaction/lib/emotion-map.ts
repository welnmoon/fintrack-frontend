import type { TransactionEmotion } from "../model/types";

type TransactionEmotionMeta = {
  label: string;
  shortLabel: string;
  emoji: string;
  badgeClassName: string;
};

export const transactionEmotionMetaMap: Record<
  TransactionEmotion,
  TransactionEmotionMeta
> = {
  NEUTRAL: {
    label: "Нейтрально",
    shortLabel: "Нейтрально",
    emoji: "🙂",
    badgeClassName:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  HAPPY: {
    label: "Хорошее настроение",
    shortLabel: "Хорошее",
    emoji: "😄",
    badgeClassName:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  IMPULSIVE: {
    label: "Импульсивно",
    shortLabel: "Импульсивно",
    emoji: "⚡",
    badgeClassName:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  STRESS: {
    label: "Стресс",
    shortLabel: "Стресс",
    emoji: "😣",
    badgeClassName:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  REGRET: {
    label: "Сожаление",
    shortLabel: "Сожаление",
    emoji: "😞",
    badgeClassName:
      "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
};

export const transactionEmotionOptions = (
  Object.entries(transactionEmotionMetaMap) as Array<
    [TransactionEmotion, TransactionEmotionMeta]
  >
).map(([value, meta]) => ({
  value,
  ...meta,
}));

export function getTransactionEmotionMeta(emotion: TransactionEmotion) {
  return transactionEmotionMetaMap[emotion];
}
