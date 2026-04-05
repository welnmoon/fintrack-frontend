import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import { Badge } from "@/shared/ui";
import type { TransactionEmotion } from "../model/types";
import { getTransactionEmotionMeta } from "../lib/emotion-map";

type EmotionBadgeProps = HTMLAttributes<HTMLDivElement> & {
  emotion: TransactionEmotion;
  showEmoji?: boolean;
};

export function EmotionBadge({
  emotion,
  showEmoji = true,
  className,
  ...props
}: EmotionBadgeProps) {
  const meta = getTransactionEmotionMeta(emotion);

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border", meta.badgeClassName, className)}
      {...props}
    >
      {showEmoji && <span aria-hidden>{meta.emoji}</span>}
      <span>{meta.shortLabel}</span>
    </Badge>
  );
}
