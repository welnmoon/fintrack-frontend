import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import { useState } from "react";
import type { UserCategory } from "@/entities/category/model/types.api";
import { HttpError } from "@/shared/api/http-client";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui";
import { useDeleteCategory } from "@/features/delete-category/api/use-delete-category";
import { UpdateCategorySheet } from "./update-category-sheet";

type CategoryActionsMenuProps = {
  category: UserCategory;
  transactionsCount: number;
  triggerClassName?: string;
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

export function CategoryActionsMenu({
  category,
  transactionsCount,
  triggerClassName,
}: CategoryActionsMenuProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { mutate: deleteCategory, isPending: isDeletePending } =
    useDeleteCategory(category.id);

  const onDelete = () => {
    if (transactionsCount > 0) {
      window.alert(
        "Нельзя удалить категорию, пока она используется в транзакциях.",
      );
      return;
    }

    const isConfirmed = window.confirm(
      `Удалить категорию "${category.name}"?`,
    );

    if (!isConfirmed) return;

    deleteCategory(undefined, {
      onError: (error) => {
        window.alert(getRequestErrorMessage(error));
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={triggerClassName ?? "h-9 w-9 rounded-full"}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Действия с категорией</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
            <PencilLine className="h-4 w-4" />
            Изменить
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={onDelete}
            disabled={isDeletePending}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {isDeletePending ? "Удаляю..." : "Удалить"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateCategorySheet
        category={category}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
