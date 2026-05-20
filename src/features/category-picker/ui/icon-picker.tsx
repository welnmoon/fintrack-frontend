import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";

type Props = {
  items: { key: CategoryIconKey; label: string }[];
  value?: CategoryIconKey;
  onChange: (key: CategoryIconKey) => void;
  color?: CategoryColorKey;
};

export function IconPicker({ items, value, onChange, color = "slate" }: Props) {
  const iconColor = getCategoryColor(color);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map((item) => {
        const Icon = getCategoryIcon(item.key);
        const isSelected = value === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={
              isSelected
                ? "flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#111] bg-[#111] transition-colors"
                : "flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#EDEAE4] bg-[#FAFAF8] transition-colors hover:border-[#DDD9D1] hover:bg-[#F0EEE9]"
            }
            aria-label={item.label}
          >
            <Icon
              style={{ color: isSelected ? "#fff" : iconColor }}
              size={15}
            />
          </button>
        );
      })}
    </div>
  );
}
