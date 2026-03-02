// icons.ts (frontend)
import type { CategoryIconKey } from "@/features/get-category-presets/model/types.api";
import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Utensils,
  Bus,
  Home,
  HeartPulse,
  GraduationCap,
  Popcorn,
  Plane,
  Receipt,
  CreditCard,
  Briefcase,
  Laptop,
  Gift,
  Percent,
  TrendingUp,
  Undo2,
  BadgeDollarSign,
  KeyRound,
  Tag,
  CircleDollarSign,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  // EXPENSE
  shopping: ShoppingCart,
  food: Utensils,
  transport: Bus,
  home: Home,
  health: HeartPulse,
  education: GraduationCap,
  entertainment: Popcorn,
  travel: Plane,
  bills: Receipt,
  subscriptions: CreditCard,

  // INCOME
  salary: Briefcase,
  freelance: Laptop,
  gift: Gift,
  interest: Percent,
  investment: TrendingUp,
  refund: Undo2,
  bonus: BadgeDollarSign,
  rental: KeyRound,
  sale: Tag,
  "other-income": CircleDollarSign,
};

export function getCategoryIcon(key: CategoryIconKey): LucideIcon {
  return CATEGORY_ICON_MAP[key];
}
