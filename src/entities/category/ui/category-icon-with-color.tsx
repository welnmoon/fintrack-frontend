import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { getCategoryIcon } from "../../../shared/lib/category/get-category-icon";
import { getCategoryColor } from "../../../shared/lib/category/get-category-color";
import { Tag } from "lucide-react";
import { createElement } from "react";

export const CategoryIconWithColor = ({
  iconKey,
  colorKey,
  size = 15,
  className,
}: {
  iconKey: CategoryIconKey | null;
  colorKey: CategoryColorKey | null;
  size?: number;
  className?: string;
}) => {
  const icon = iconKey ? getCategoryIcon(iconKey) : Tag;
  const color = colorKey ? getCategoryColor(colorKey) : "#898989";

  return createElement(icon, {
    size,
    className,
    style: {
      color,
    },
  });
};
