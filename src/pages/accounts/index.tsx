import { formatCurrency } from "@/shared/lib";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/ui";
import { PageContainer, PageHeader } from "@/widgets/page-shell";
import { useGetAccounts } from "@/entities/account/api/use-get-accounts";
import CreateAccountForm from "@/features/accounts/create-account/ui/create-account-form";
import SetBalanceFormPopover from "@/features/accounts/set-balance/ui/set-balance-form.popover";
import MakeTransferFormPopover from "@/features/make-transfer/ui/make-transfer-form.popover";

export function AccountsPage() {
  const { data: accounts, isLoading, isError, error } = useGetAccounts();
  const errorMessage =
    error instanceof Error ? error.message : "Неизвестная ошибка";

  return (
    <PageContainer>
      <PageHeader
        title="Счета"
        description="Карточки счетов для визуального отображения структуры баланса."
      />
      <CreateAccountForm />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`account-loading-${index}`}>
              <CardHeader className="space-y-3 pb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-7 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-40" />
                <div className="mt-3">
                  <Skeleton className="h-10 w-36" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}

        {isError && (
          <p className="text-sm text-destructive">
            Ошибка загрузки счетов: {errorMessage}
          </p>
        )}

        {!isLoading && !isError && (!accounts || accounts.length === 0) && (
          <p className="text-sm text-muted-foreground">Счетов пока нет.</p>
        )}

        {!isLoading &&
          !isError &&
          accounts &&
          accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="space-y-3 pb-2">
                <Badge variant="secondary" className="w-fit">
                  {account.type}
                </Badge>
                <CardTitle>{account.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {formatCurrency(account.balance, account.currency)}
                </p>
                <div className="mt-3">
                  <SetBalanceFormPopover
                    accountId={account.id}
                    triggerLabel="Изменить баланс"
                  />
                </div>
                <div className="mt-2">
                  <MakeTransferFormPopover
                    accounts={accounts}
                    defaultFromAccountId={account.id}
                    triggerLabel="Перевести"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">...</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </PageContainer>
  );
}
