import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { getCategoryIcon } from "../../../shared/lib/category/get-category-icon";
import { getCategoryColor } from "../../../shared/lib/category/get-category-color";

export const CategoryIconWithColor = ({
  iconKey,
  colorKey,
}: {
  iconKey: CategoryIconKey;
  colorKey: CategoryColorKey;
}) => {
  const Icon = getCategoryIcon(iconKey);
  const color = getCategoryColor(colorKey);

  return (
    <Icon
      style={{
        color: color,
      }}
    />
  );
};
