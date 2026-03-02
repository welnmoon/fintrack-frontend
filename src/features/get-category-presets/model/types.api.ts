export type ExpenseIconKey =
  | "shopping"
  | "food"
  | "transport"
  | "home"
  | "health"
  | "education"
  | "entertainment"
  | "travel"
  | "bills"
  | "subscriptions";

export type IncomeIconKey =
  | "salary"
  | "freelance"
  | "gift"
  | "interest"
  | "investment"
  | "refund"
  | "bonus"
  | "rental"
  | "sale"
  | "other-income";

export type CategoryIconKey = ExpenseIconKey | IncomeIconKey;

export type CategoryColorKey =
  | "violet"
  | "blue"
  | "sky"
  | "green"
  | "emerald"
  | "yellow"
  | "orange"
  | "red"
  | "pink"
  | "slate";

export type GetCategories = {
  icons: {
    INCOME: Record<
      IncomeIconKey,
      {
        label: string;
      }
    >;
    EXPENSE: Record<
      ExpenseIconKey,
      {
        label: string;
      }
    >;
  };
  colors: Record<
    CategoryColorKey,
    {
      label: string;
      hex: `#${string}`;
    }
  >;
};
