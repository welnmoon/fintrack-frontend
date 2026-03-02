import * as DialogPrimitive from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, X } from "lucide-react";
import { useMakeTransfer } from "../api/use-make-transfer";
import { createTransferSchema, type CreateTransferDto } from "../model/schema";
import type { GetAccount } from "@/entities/account/model/types.api";
import { cn } from "@/shared/lib";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

type MakeTransferFormDialogProps = {
  accounts: GetAccount[];
  defaultFromAccountId?: string;
  triggerLabel?: string;
};

const MakeTransferFormDialog = ({
  accounts,
  defaultFromAccountId,
  triggerLabel = "Создать перевод",
}: MakeTransferFormDialogProps) => {
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
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button type="button" disabled={accounts.length < 2}>
          <ArrowLeftRight className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg",
            "focus:outline-none",
          )}
        >
          <DialogPrimitive.Title className="text-lg font-semibold">
            Новый перевод
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
            Перевод между счетами.
          </DialogPrimitive.Description>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">Закрыть</span>
          </DialogPrimitive.Close>

          <form
            className="mt-5 space-y-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                htmlFor="transfer-from-account"
              >
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
              <label
                className="text-sm font-medium"
                htmlFor="transfer-to-account"
              >
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Перевожу..." : "Перевести"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default MakeTransferFormDialog;
