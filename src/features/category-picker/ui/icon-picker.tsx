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
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((item) => {
        const Icon = getCategoryIcon(item.key);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            style={{
              padding: 8,
              border: value === item.key ? "2px solid black" : "1px solid #ccc",
              borderRadius: 8,
              cursor: "pointer",
              background: "white",
            }}
          >
            <Icon
              style={{
                color: iconColor,
              }}
              size={20}
            />
          </button>
        );
      })}
    </div>
  );
}
