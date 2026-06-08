import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArrowLeftRight,
  MoreHorizontal,
  Palette,
  Trash2,
  Wallet2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { AccountBackgroundKey } from "@/entities/account/lib/account-backgrounds";
import type { GetAccount } from "@/entities/account/model/types.api";
import { AccountBackgroundPicker } from "@/entities/account/ui/account-background-picker";
import { useArchiveAccount } from "@/features/accounts/archive-account/api/use-archive-account";
import { useDeleteAccount } from "@/features/accounts/delete-account/api/use-delete-account";
import { useSetBalance } from "@/features/accounts/set-balance/api/use-set-balance";
import {
  setBalanceFormSchema,
  type SetBalanceFormType,
} from "@/features/accounts/set-balance/model/schema";
import { balanceHistoryQueryKey } from "@/features/get-dashboard/api/use-balance-history";
import { dashboardQueryKey } from "@/features/get-dashboard/api/use-get-dashboard";
import { useMakeTransfer } from "@/features/make-transfer/api/use-make-transfer";
import {
  createTransferSchema,
  type CreateTransferDto,
} from "@/features/make-transfer/model/schema";
import { HttpError } from "@/shared/api/http-client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { useUpdateAccountBackground } from "../../update-background/api/use-update-account-background";

type ActivePanel = "balance" | "transfer" | "background" | null;
type ConfirmAction = "archive" | "delete" | null;

type AccountActionsMenuProps = {
  account: GetAccount;
  accounts: GetAccount[];
};

function getRequestErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.bodyText) {
    try {
      const parsed = JSON.parse(error.bodyText) as {
        message?: string | string[];
      };

      if (Array.isArray(parsed.message)) {
        return parsed.message.join(", ");
      }

      if (typeof parsed.message === "string") {
        return parsed.message;
      }
    } catch {
      return error.bodyText;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Не удалось выполнить действие";
}

export function AccountActionsMenu({
  account,
  accounts,
}: AccountActionsMenuProps) {
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [backgroundKey, setBackgroundKey] = useState<AccountBackgroundKey>(
    account.backgroundKey,
  );

  const balanceForm = useForm<SetBalanceFormType>({
    defaultValues: {
      amount: account.balance,
      note: "",
    },
    resolver: zodResolver(setBalanceFormSchema),
    mode: "onChange",
  });

  const transferForm = useForm<CreateTransferDto>({
    defaultValues: {
      fromAccountId: account.id,
      toAccountId: "",
      amount: 0,
    },
    resolver: zodResolver(createTransferSchema),
    mode: "onChange",
  });

  const { mutate: setBalance, isPending: isBalancePending, error: balanceError } =
    useSetBalance(account.id);
  const {
    mutate: makeTransfer,
    isPending: isTransferPending,
    error: transferError,
  } = useMakeTransfer();
  const {
    mutate: updateBackground,
    isPending: isBackgroundPending,
    error: backgroundError,
  } = useUpdateAccountBackground(account.id);
  const { mutate: archiveAccount, isPending: isArchivePending } =
    useArchiveAccount(account.id);
  const { mutate: deleteAccount, isPending: isDeletePending } =
    useDeleteAccount(account.id);

  const fromAccountId = useWatch({
    control: transferForm.control,
    name: "fromAccountId",
  });

  const toAccountOptions = useMemo(
    () => accounts.filter((item) => item.id !== fromAccountId),
    [accounts, fromAccountId],
  );

  const openBalancePanel = () => {
    balanceForm.reset({
      amount: account.balance,
      note: "",
    });
    setActivePanel("balance");
  };

  const openTransferPanel = () => {
    transferForm.reset({
      fromAccountId: account.id,
      toAccountId: "",
      amount: 0,
    });
    setActivePanel("transfer");
  };

  const openBackgroundPanel = () => {
    setBackgroundKey(account.backgroundKey);
    setActivePanel("background");
  };

  const closePanel = () => setActivePanel(null);

  const onBalanceSubmit = (values: SetBalanceFormType) => {
    setBalance(
      { dto: values },
      {
        onSuccess: () => {
          closePanel();
        },
      },
    );
  };

  const onTransferSubmit = (values: CreateTransferDto) => {
    if (values.fromAccountId === values.toAccountId) {
      transferForm.setError("toAccountId", {
        type: "validate",
        message: "Счет назначения должен отличаться",
      });
      return;
    }

    makeTransfer(values, {
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: ["accounts"] });
        await qc.invalidateQueries({ queryKey: [dashboardQueryKey] });
        await qc.invalidateQueries({ queryKey: [balanceHistoryQueryKey] });
        closePanel();
      },
    });
  };

  const onBackgroundSubmit = () => {
    updateBackground(
      { backgroundKey },
      {
        onSuccess: () => {
          closePanel();
        },
      },
    );
  };

  const onDelete = () => {
    deleteAccount(undefined, {
      onError: (error) => {
        window.alert(getRequestErrorMessage(error));
      },
      onSuccess: () => {
        setConfirmAction(null);
      },
    });
  };

  const onArchive = () => {
    archiveAccount(undefined, {
      onError: (error) => {
        window.alert(getRequestErrorMessage(error));
      },
      onSuccess: () => {
        setConfirmAction(null);
      },
    });
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-white/15 bg-black/10 text-white shadow-none backdrop-blur hover:bg-white/15 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Действия со счетом</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={openBalancePanel}>
            <Wallet2 className="h-4 w-4" />
            Установить баланс
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={openTransferPanel}
            disabled={accounts.length < 2}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Перевести
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={openBackgroundPanel}>
            <Palette className="h-4 w-4" />
            Изменить фон
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setMenuOpen(false);
              setConfirmAction("archive");
            }}
            disabled={isArchivePending}
          >
            <Archive className="h-4 w-4" />
            {isArchivePending ? "Архивирую..." : "Архивировать счет"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setMenuOpen(false);
              setConfirmAction("delete");
            }}
            disabled={isDeletePending}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {isDeletePending ? "Удаляю..." : "Удалить счет"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "archive"
                ? "Архивировать счет"
                : "Удалить счет"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "archive"
                ? `Счет "${account.name}" исчезнет из активных счетов и перестанет учитываться в лимите бесплатного плана. История операций сохранится.`
                : `Счет "${account.name}" будет удален только если он пустой и не содержит операций или переводов.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAction(null)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant={confirmAction === "delete" ? "destructive" : "default"}
              onClick={confirmAction === "archive" ? onArchive : onDelete}
              disabled={isArchivePending || isDeletePending}
            >
              {confirmAction === "archive"
                ? isArchivePending
                  ? "Архивирую..."
                  : "Архивировать"
                : isDeletePending
                  ? "Удаляю..."
                  : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={activePanel !== null} onOpenChange={(open) => !open && closePanel()}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {activePanel === "balance" && (
            <>
              <SheetHeader>
                <SheetTitle>Установить баланс</SheetTitle>
                <SheetDescription>
                  Новая сумма станет текущим балансом счета {account.name}.
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-4" />

              <form
                className="space-y-4"
                noValidate
                onSubmit={balanceForm.handleSubmit(onBalanceSubmit)}
              >
                <FormInput
                  control={balanceForm.control}
                  name="amount"
                  label="Новый баланс"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="10"
                  placeholder="0"
                />

                <FormInput
                  control={balanceForm.control}
                  name="note"
                  label="Комментарий"
                  placeholder="Причина изменения баланса"
                  textarea
                  rows={3}
                  maxLength={200}
                />

                {balanceError && (
                  <p className="text-sm text-destructive">
                    {getRequestErrorMessage(balanceError)}
                  </p>
                )}

                <SheetFooter className="pt-2">
                  <Button type="button" variant="ghost" onClick={closePanel}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isBalancePending}>
                    {isBalancePending ? "Сохраняю..." : "Сохранить"}
                  </Button>
                </SheetFooter>
              </form>
            </>
          )}

          {activePanel === "transfer" && (
            <>
              <SheetHeader>
                <SheetTitle>Перевод между счетами</SheetTitle>
                <SheetDescription>
                  Быстрый перевод со счета {account.name}.
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-4" />

              <form
                className="space-y-4"
                noValidate
                onSubmit={transferForm.handleSubmit(onTransferSubmit)}
              >
                <div className="space-y-1.5">
                  <Label htmlFor={`transfer-from-account-${account.id}`}>
                    Со счета
                  </Label>
                  <Controller
                    name="fromAccountId"
                    control={transferForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={`transfer-from-account-${account.id}`}>
                          <SelectValue placeholder="Выберите счет" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {transferForm.formState.errors.fromAccountId?.message && (
                    <p className="text-xs text-destructive">
                      {transferForm.formState.errors.fromAccountId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`transfer-to-account-${account.id}`}>
                    На счет
                  </Label>
                  <Controller
                    name="toAccountId"
                    control={transferForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={`transfer-to-account-${account.id}`}>
                          <SelectValue placeholder="Выберите счет" />
                        </SelectTrigger>
                        <SelectContent>
                          {toAccountOptions.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {transferForm.formState.errors.toAccountId?.message && (
                    <p className="text-xs text-destructive">
                      {transferForm.formState.errors.toAccountId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`transfer-amount-${account.id}`}>Сумма</Label>
                  <Input
                    id={`transfer-amount-${account.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    placeholder="0"
                    className={
                      transferForm.formState.errors.amount
                        ? "border-red-400 focus-visible:ring-red-400"
                        : undefined
                    }
                    {...transferForm.register("amount")}
                  />
                  {transferForm.formState.errors.amount?.message && (
                    <p className="text-xs text-destructive">
                      {transferForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                {transferError && (
                  <p className="text-sm text-destructive">
                    {getRequestErrorMessage(transferError)}
                  </p>
                )}

                <SheetFooter className="pt-2">
                  <Button type="button" variant="ghost" onClick={closePanel}>
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isTransferPending || accounts.length < 2}
                  >
                    {isTransferPending ? "Перевожу..." : "Перевести"}
                  </Button>
                </SheetFooter>
              </form>
            </>
          )}

          {activePanel === "background" && (
            <>
              <SheetHeader>
                <SheetTitle>Изменить фон счета</SheetTitle>
                <SheetDescription>
                  Выбери градиент для карточки счета {account.name}.
                </SheetDescription>
              </SheetHeader>

              <Separator className="my-4" />

              <div className="space-y-4">
                <AccountBackgroundPicker
                  value={backgroundKey}
                  onChange={setBackgroundKey}
                  className="lg:grid-cols-2"
                />

                {backgroundError && (
                  <p className="text-sm text-destructive">
                    {getRequestErrorMessage(backgroundError)}
                  </p>
                )}

                <SheetFooter className="pt-2">
                  <Button type="button" variant="ghost" onClick={closePanel}>
                    Отмена
                  </Button>
                  <Button
                    type="button"
                    onClick={onBackgroundSubmit}
                    disabled={isBackgroundPending}
                  >
                    {isBackgroundPending ? "Сохраняю..." : "Сохранить"}
                  </Button>
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
