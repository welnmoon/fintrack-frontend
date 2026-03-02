import type { CategoryColorKey } from "@/features/get-category-presets/model/types.api";
import { CATEGORY_COLORS } from "@/shared/config/category-colors";

export function getCategoryColor(key: CategoryColorKey): string {
  return CATEGORY_COLORS[key].hex;
}
