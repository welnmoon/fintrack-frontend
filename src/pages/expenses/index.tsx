import { TransactionFeed, type TransactionType } from "@/entities/transaction";
import { useGetTransactions } from "@/entities/transaction/api/use-get-transactions";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
import CreateTransactionDialog from "@/features/create-transaction/ui/create-transaction-dialog";
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

const TRANSACTION_TYPE: TransactionType = "EXPENSE";

export function ExpensesPage() {
  const { data, isLoading, isError, error } = useGetTransactions();
  const { data: accountOptions } = useGetAccountOptions();
  const transactions = data?.filter((item) => item.type === TRANSACTION_TYPE);
  const errorMessage =
    error instanceof Error ? error.message : "Неизвестная ошибка";
  const accountById = new Map(
    (accountOptions ?? []).map((account) => [account.id, account]),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Расходы"
        description="Операции расходов с визуальными фильтрами (UI-only)."
        actions={
          <CreateTransactionDialog
            type={TRANSACTION_TYPE}
            triggerLabel="Добавить расход"
          />
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-[#EDEAE4] px-6 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#C0BCB4]">
              Фильтры
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Input placeholder="Поиск по описанию" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Счет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все счета</SelectItem>
                  <SelectItem value="main">Основная карта</SelectItem>
                  <SelectItem value="cash">Наличные</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" />
              <Input type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <TransactionFeed
            transactions={transactions}
            accountById={accountById}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            emptyLabel="Расходов пока нет"
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
