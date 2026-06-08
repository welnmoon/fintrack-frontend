import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useGetTransactions } from "@/entities/transaction/api/use-get-transactions";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
import CreateTransactionDialog from "@/features/create-transaction/ui/create-transaction-dialog";
import { DateRangePicker } from "@/widgets/dashboard/expense-pie/ui/date-range-picker";
import { TransactionList } from "@/widgets/transaction-list/ui/transaction-list";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

export function TransactionsPage() {
  const [range, setRange] = useState<DateRange | undefined>();
  const { data, isLoading, isError, error } = useGetTransactions();
  const { data: accountOptions } = useGetAccountOptions();

  const filteredTransactions = useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      if (!range?.from && !range?.to) return true;
      const time = item.occurredAt.getTime();
      const from = range.from
        ? new Date(
            range.from.getFullYear(),
            range.from.getMonth(),
            range.from.getDate(),
            0,
            0,
            0,
            0,
          ).getTime()
        : Number.NEGATIVE_INFINITY;
      const to = range.to
        ? new Date(
            range.to.getFullYear(),
            range.to.getMonth(),
            range.to.getDate(),
            23,
            59,
            59,
            999,
          ).getTime()
        : Number.POSITIVE_INFINITY;

      return time >= from && time <= to;
    });
  }, [data, range]);

  const accountById = new Map(
    (accountOptions ?? []).map((account) => [account.id, account]),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Операции"
        description="Единый журнал доходов, расходов и корректировок с итогами по периоду."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker value={range} onChange={setRange} />
            <CreateTransactionDialog type="INCOME" triggerLabel="Добавить доход" />
            <CreateTransactionDialog type="EXPENSE" triggerLabel="Добавить расход" />
            <CreateTransactionDialog
              type="ADJUSTMENT"
              triggerLabel="Добавить корректировку"
            />
          </div>
        }
      />
      <TransactionList
        transactions={filteredTransactions}
        accountById={accountById}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        emptyLabel="Операций за выбранный период нет"
        showSummary
        summaryLabel={
          range?.from || range?.to
            ? "Выбранный период"
            : "Все операции"
        }
      />
    </PageContainer>
  );
}
