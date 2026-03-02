import type { CategoryColorKey } from "@/features/get-category-presets/model/types.api";

export const CATEGORY_COLORS: Record<
  CategoryColorKey,
  { label: string; hex: `#${string}` }
> = {
  violet: { label: "Violet", hex: "#8B5CF6" },
  blue: { label: "Blue", hex: "#3B82F6" },
  sky: { label: "Sky", hex: "#0EA5E9" },
  green: { label: "Green", hex: "#22C55E" },
  emerald: { label: "Emerald", hex: "#10B981" },
  yellow: { label: "Yellow", hex: "#EAB308" },
  orange: { label: "Orange", hex: "#F97316" },
  red: { label: "Red", hex: "#EF4444" },
  pink: { label: "Pink", hex: "#EC4899" },
  slate: { label: "Slate", hex: "#64748B" },
};
