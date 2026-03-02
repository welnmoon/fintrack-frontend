import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { useSetBalance } from "../api/use-set-balance";
import { setBalanceFormSchema, type SetBalanceFormType } from "../model/schema";

type SetBalanceFormPopoverProps = {
  accountId: string;
  triggerLabel?: string;
};

const SetBalanceFormPopover = ({
  accountId,
  triggerLabel = "Установить баланс",
}: SetBalanceFormPopoverProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<SetBalanceFormType>({
    defaultValues: {
      amount: 0,
      note: "",
    },
    resolver: zodResolver(setBalanceFormSchema),
    mode: "onChange",
  });

  const { mutate, isPending, error } = useSetBalance(accountId);

  const onSubmit = (values: SetBalanceFormType) => {
    if (isPending) return;

    mutate(
      { dto: values },
      {
        onSuccess: () => {
          form.reset({
            amount: values.amount,
            note: "",
          });
          setOpen(false);
        },
      },
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-4">
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput
            control={form.control}
            name="amount"
            label="Новый баланс"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="0"
          />

          <FormInput
            control={form.control}
            name="note"
            label="Комментарий (опционально)"
            placeholder="Причина изменения баланса"
            textarea
            rows={3}
            maxLength={200}
          />

          {error instanceof Error && (
            <p className="text-sm text-red-500">Ошибка: {error.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Сохраняю..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SetBalanceFormPopover;
