import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/shared/lib";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui";

type Props = {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  buttonClassName?: string;
};

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function DateRangePicker({ value, onChange, buttonClassName }: Props) {
  const label =
    value?.from && value?.to
      ? `${formatDate(value.from)} - ${formatDate(value.to)}`
      : value?.from
        ? formatDate(value.from)
        : "Выберите период";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 justify-start rounded-[8px] border-[#DDD9D1] bg-[#F7F6F3] px-3 text-left font-mono text-[11px] font-medium text-[#555] hover:bg-[#F1EFEB]",
            buttonClassName,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-[#AAA49C]" />
          <span>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value}
          onSelect={onChange}
          disabled={{ after: new Date() }}
          defaultMonth={value?.from}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
