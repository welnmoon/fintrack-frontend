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

const TRANSACTION_TYPE: TransactionType = "ADJUSTMENT";

export function AdjustmentPage() {
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
        title="Корректировки"
        description="Список доходных операций и фильтры для будущей интеграции."
        actions={
          <CreateTransactionDialog
            type={TRANSACTION_TYPE}
            triggerLabel="Добавить корректировку"
          />
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Поиск по описанию" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Источник дохода" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все источники</SelectItem>
                <SelectItem value="salary">Зарплата</SelectItem>
                <SelectItem value="freelance">Фриланс</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" />
            <Input type="date" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <TransactionFeed
            transactions={transactions}
            accountById={accountById}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            emptyLabel="Корректировок пока нет"
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
