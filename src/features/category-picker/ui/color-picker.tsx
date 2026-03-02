import type { CategoryColorKey } from "@/features/get-category-presets/model/types.api";

type Props = {
  value?: CategoryColorKey;
  onChange: (key: CategoryColorKey) => void;
  colors: Record<
    CategoryColorKey,
    {
      label: string;
      hex: `#${string}`;
    }
  >;
};

export function ColorPicker({ value, onChange, colors }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {Object.entries(colors).map(([key, color]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key as CategoryColorKey)}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: color.hex,
            border: value === key ? "3px solid black" : "1px solid #ccc",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}
