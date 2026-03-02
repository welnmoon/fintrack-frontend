import type { CategoryType } from "@/entities/category";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";

export type CreateCategoryDto = {
  name: string;
  type: CategoryType;
  iconKey?: CategoryIconKey;
  colorKey?: CategoryColorKey;
};
