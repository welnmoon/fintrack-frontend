import type { QueryClient } from "@tanstack/react-query";
import { balanceHistoryQueryKey } from "@/features/get-dashboard/api/use-balance-history";
import { dashboardQueryKey } from "@/features/get-dashboard/api/use-get-dashboard";
import { expensePieQueryKey } from "@/features/get-dashboard/api/use-expense-pie";

export async function invalidateFinancialData(qc: QueryClient) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ["transactions"] }),
    qc.invalidateQueries({ queryKey: ["accounts"] }),
    qc.invalidateQueries({ queryKey: ["accounts", "archived"] }),
    qc.invalidateQueries({ queryKey: ["account-options"] }),
    qc.invalidateQueries({ queryKey: dashboardQueryKey }),
    qc.invalidateQueries({ queryKey: [balanceHistoryQueryKey] }),
    qc.invalidateQueries({ queryKey: [expensePieQueryKey] }),
  ]);
}
