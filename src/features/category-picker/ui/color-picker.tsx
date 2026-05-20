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
    <div className="flex flex-wrap items-center gap-1.5">
      {Object.entries(colors).map(([key, color]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key as CategoryColorKey)}
          className="h-[22px] w-[22px] cursor-pointer rounded-full border-2 border-transparent transition-transform hover:scale-110"
          style={{
            background: color.hex,
            boxShadow: value === key ? "0 0 0 2px #333" : undefined,
            borderColor: value === key ? "#fff" : "transparent",
          }}
          aria-label={color.label}
        />
      ))}
    </div>
  );
}
