import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { TransactionType } from "@/entities/transaction";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";
import CreateTransactionForm from "./create-transaction-form";

type CreateTransactionDialogProps = {
  type?: TransactionType;
  triggerLabel?: string;
};

const CreateTransactionDialog = ({
  type,
  triggerLabel = "Добавить транзакцию",
}: CreateTransactionDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button type="button">
          <Plus className="h-4 w-4" />
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
            Новая транзакция
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
            Заполните форму операции.
          </DialogPrimitive.Description>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">Закрыть</span>
          </DialogPrimitive.Close>

          <CreateTransactionForm
            type={type}
            onSubmitStart={() => {
              if (type === "EXPENSE" || type === "INCOME") {
                setOpen(false);
              }
            }}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CreateTransactionDialog;
