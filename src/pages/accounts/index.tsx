import { formatCurrency } from "@/shared/lib";
import { cn } from "@/shared/lib";
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
import { getAccountBackgroundClassName } from "@/entities/account/lib/account-backgrounds";
import { AccountActionsMenu } from "@/features/accounts/account-actions/ui/account-actions-menu";
import CreateAccountForm from "@/features/accounts/create-account/ui/create-account-form";

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
            <Card
              key={account.id}
              className={cn(
                "border-0 shadow-lg",
                getAccountBackgroundClassName(account.backgroundKey),
              )}
            >
              <CardHeader className="space-y-3 pb-2 text-white">
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    variant="outline"
                    className="w-fit border-white/20 bg-white/10 text-white"
                  >
                    {account.type}
                  </Badge>
                  <AccountActionsMenu account={account} accounts={accounts} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="pr-8">{account.name}</CardTitle>
                  <p className="text-xs text-white/75">
                    {account.accountNumber ?? "Номер счета появится после создания"}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="text-white">
                <p className="text-3xl font-semibold tracking-tight">
                  {formatCurrency(account.balance, account.currency)}
                </p>
                <p className="mt-4 text-xs text-white/75">
                  Валюта: {account.currency}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </PageContainer>
  );
}
