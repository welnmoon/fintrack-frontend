import type { TransactionType } from "@/entities/transaction";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { useGetTransactions } from "@/entities/transaction/api/use-get-transactions";
import { useGetAccountOptions } from "@/entities/account/api/use-get-account-options";
import CreateTransactionDialog from "@/features/create-transaction/ui/create-transaction-dialog";
import { DEFAULT_CATEGORY_COLOR } from "@/shared/const/category";
import { getCategoryColor } from "@/shared/lib/category/get-category-color";
import { getCategoryIcon } from "@/shared/lib/category/get-category-icon";
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
import type { LucideIcon } from "lucide-react";
import { Tag } from "lucide-react";
import { PageContainer, PageHeader } from "@/widgets/page-shell";

const TRANSACTION_TYPE: TransactionType = "EXPENSE";

function resolveCategoryColor(colorKey: string | null | undefined): string {
  if (!colorKey) return DEFAULT_CATEGORY_COLOR;

  try {
    return getCategoryColor(colorKey as CategoryColorKey);
  } catch {
    return DEFAULT_CATEGORY_COLOR;
  }
}

function resolveCategoryIcon(iconKey: string | null | undefined): LucideIcon {
  if (!iconKey) return Tag;

  try {
    return getCategoryIcon(iconKey as CategoryIconKey) ?? Tag;
  } catch {
    return Tag;
  }
}

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
        <CardContent className="pt-6">
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
                transactions?.map((item) => {
                  const account = accountById.get(item.accountId);
                  const CategoryIcon = resolveCategoryIcon(item.category?.icon);
                  const categoryColor = resolveCategoryColor(
                    item.category?.color,
                  );

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.occurredAt)}</TableCell>
                      <TableCell>{item.note ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryIcon
                            className="h-4 w-4 shrink-0"
                            style={{ color: categoryColor }}
                          />
                          <span>{item.category?.name ?? "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {account
                          ? `${account.name} (${account.currency})`
                          : item.accountId}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount, item.account.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
