import {
  ACCOUNT_BACKGROUND_OPTIONS,
  getAccountBackgroundClassName,
  type AccountBackgroundKey,
} from "@/entities/account/lib/account-backgrounds";
import { cn } from "@/shared/lib";

type AccountBackgroundPickerProps = {
  value: AccountBackgroundKey;
  onChange: (value: AccountBackgroundKey) => void;
  className?: string;
};

export function AccountBackgroundPicker({
  value,
  onChange,
  className,
}: AccountBackgroundPickerProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-5", className)}>
      {ACCOUNT_BACKGROUND_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "rounded-2xl border p-2 text-left transition-transform hover:-translate-y-0.5",
              isSelected
                ? "border-primary ring-2 ring-primary/30"
                : "border-border/70",
            )}
            onClick={() => onChange(option.value)}
          >
            <div
              className={cn(
                "h-20 rounded-xl p-3",
                getAccountBackgroundClassName(option.value),
              )}
            >
              <div className="flex h-full items-end justify-between text-xs font-medium text-white/90">
                <span>Fintrack</span>
                <span>KZT</span>
              </div>
            </div>
            <p className="px-1 pt-2 text-xs font-medium text-foreground">
              {option.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
