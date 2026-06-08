import { useGetTransactions } from "@/entities/transaction/api/use-get-transactions";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
import CreateTransactionDialog from "@/features/create-transaction/ui/create-transaction-dialog";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import { TransactionList } from "@/widgets/transaction-list/ui/transaction-list";
import type { TransactionType } from "@/entities/transaction";

const TRANSACTION_TYPE: TransactionType = "INCOME";

export function IncomePage() {
  const { data, isLoading, isError, error } = useGetTransactions();
  const { data: accountOptions } = useGetAccountOptions();

  const transactions = data?.filter((item) => item.type === TRANSACTION_TYPE);
  const accountById = new Map(
    (accountOptions ?? []).map((account) => [account.id, account]),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Доходы"
        description="Все доходные операции, сгруппированные по дате."
        actions={
          <CreateTransactionDialog
            type={TRANSACTION_TYPE}
            triggerLabel="Добавить доход"
          />
        }
      />
      <TransactionList
        transactions={transactions}
        accountById={accountById}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        emptyLabel="Доходов пока нет"
        showSummary={false}
      />
    </PageContainer>
  );
}
