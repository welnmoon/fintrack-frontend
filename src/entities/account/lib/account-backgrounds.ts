export const ACCOUNT_BACKGROUND_OPTIONS = [
  { value: "aurora-teal", label: "Aurora Teal" },
  { value: "midnight-indigo", label: "Midnight Indigo" },
  { value: "sunset-coral", label: "Sunset Coral" },
  { value: "emerald-lagoon", label: "Emerald Lagoon" },
  { value: "amber-ember", label: "Amber Ember" },
  { value: "ocean-breeze", label: "Ocean Breeze" },
  { value: "graphite-gold", label: "Graphite Gold" },
  { value: "rose-dusk", label: "Rose Dusk" },
  { value: "frost-blue", label: "Frost Blue" },
  { value: "forest-mint", label: "Forest Mint" },
] as const;

export type AccountBackgroundKey =
  (typeof ACCOUNT_BACKGROUND_OPTIONS)[number]["value"];

export const DEFAULT_ACCOUNT_BACKGROUND_KEY: AccountBackgroundKey =
  "aurora-teal";

export function getAccountBackgroundClassName(backgroundKey?: string | null) {
  const resolvedKey =
    ACCOUNT_BACKGROUND_OPTIONS.find((item) => item.value === backgroundKey)
      ?.value ?? DEFAULT_ACCOUNT_BACKGROUND_KEY;

  return `account-bg account-bg--${resolvedKey}`;
}
