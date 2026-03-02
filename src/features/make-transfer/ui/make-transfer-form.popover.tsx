import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useMakeTransfer } from "../api/use-make-transfer";
import { createTransferSchema, type CreateTransferDto } from "../model/schema";
import type { GetAccount } from "@/entities/account/model/types.api";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

type MakeTransferFormPopoverProps = {
  accounts: GetAccount[];
  defaultFromAccountId?: string;
  triggerLabel?: string;
};

const MakeTransferFormPopover = ({
  accounts,
  defaultFromAccountId,
  triggerLabel = "Перевести",
}: MakeTransferFormPopoverProps) => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error } = useMakeTransfer();

  const form = useForm<CreateTransferDto>({
    defaultValues: {
      fromAccountId: defaultFromAccountId ?? "",
      toAccountId: "",
      amount: 0,
    },
    resolver: zodResolver(createTransferSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!defaultFromAccountId) return;
    form.setValue("fromAccountId", defaultFromAccountId, {
      shouldValidate: true,
    });
  }, [defaultFromAccountId, form]);

  const fromAccountId = useWatch({
    control: form.control,
    name: "fromAccountId",
  });
  const toAccountOptions = accounts.filter(
    (account) => account.id !== fromAccountId,
  );

  const onSubmit = (values: CreateTransferDto) => {
    if (values.fromAccountId === values.toAccountId) {
      form.setError("toAccountId", {
        type: "validate",
        message: "Счет назначения должен отличаться",
      });
      return;
    }

    mutate(values, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["accounts"] });
        form.reset({
          fromAccountId: defaultFromAccountId ?? "",
          toAccountId: "",
          amount: 0,
        });
        setOpen(false);
      },
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={accounts.length < 2}>
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-4">
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="transfer-from-account">
              С аккаунта
            </label>
            <Controller
              name="fromAccountId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="transfer-from-account"
                    className={
                      form.formState.errors.fromAccountId
                        ? "border-red-400 focus:ring-red-400"
                        : undefined
                    }
                  >
                    <SelectValue placeholder="Выберите счет" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.fromAccountId?.message && (
              <p className="text-xs text-red-500">
                {form.formState.errors.fromAccountId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="transfer-to-account">
              На аккаунт
            </label>
            <Controller
              name="toAccountId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="transfer-to-account"
                    className={
                      form.formState.errors.toAccountId
                        ? "border-red-400 focus:ring-red-400"
                        : undefined
                    }
                  >
                    <SelectValue placeholder="Выберите счет" />
                  </SelectTrigger>
                  <SelectContent>
                    {toAccountOptions.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.toAccountId?.message && (
              <p className="text-xs text-red-500">
                {form.formState.errors.toAccountId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="transfer-amount">
              Сумма
            </label>
            <Input
              id="transfer-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              className={
                form.formState.errors.amount
                  ? "border-red-400 focus-visible:ring-red-400"
                  : undefined
              }
              {...form.register("amount")}
            />
            {form.formState.errors.amount?.message && (
              <p className="text-xs text-red-500">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {error instanceof Error && (
            <p className="text-sm text-red-500">Ошибка: {error.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Перевожу..." : "Перевести"}
            </Button>
          </div>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MakeTransferFormPopover;
