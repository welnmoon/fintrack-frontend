import type { TransactionType } from "@/entities/transaction";
import { useGetTransactions } from "@/entities/transaction/api/use-get-transactions";
import CreateTransactionDialog from "@/features/create-transaction/ui/create-transaction-dialog";
import { formatCurrency, formatDate } from "@/shared/lib";
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

const TRANSACTION_TYPE: TransactionType = "ADJUSTMENT";

export function AdjustmentPage() {
  const { data, isLoading, isError, error } = useGetTransactions();
  const transactions = data?.filter((item) => item.type === TRANSACTION_TYPE);
  const errorMessage =
    error instanceof Error ? error.message : "Неизвестная ошибка";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Счет</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Загрузка...
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-destructive"
                  >
                    Ошибка загрузки: {errorMessage}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                !isError &&
                (!transactions || transactions.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Пусто
                    </TableCell>
                  </TableRow>
                )}
              {!isLoading &&
                !isError &&
                transactions?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.occurredAt)}</TableCell>
                    <TableCell>{item.note ?? "-"}</TableCell>
                    <TableCell>{item.category?.name ?? "-"}</TableCell>
                    <TableCell>{item.accountId}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount, item.account.currency)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
