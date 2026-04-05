export const accountApi = {
  getAccounts: () => "accounts" as const,
  createAccount: () => `accounts` as const,
  updateBackground: (accountId: string) =>
    `accounts/${accountId}/background` as const,
  setBalance: (accountId: string) => `accounts/${accountId}/set-balance` as const,
  deleteAccount: (accountId: string) => `accounts/${accountId}` as const,
  getAccountOptions: () => "accounts/options" as const,
};
