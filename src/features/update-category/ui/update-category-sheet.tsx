import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { UserCategory } from "@/entities/category/model/types.api";
import { getCategoryTypeLabel } from "@/entities/category/lib/category-type";
import { ColorPicker } from "@/features/category-picker/ui/color-picker";
import { IconPicker } from "@/features/category-picker/ui/icon-picker";
import { useGetCategoryPresets } from "@/features/get-category-presets/api/use-get-presets";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { CATEGORY_COLORS } from "@/shared/config/category-colors";
import {
  Button,
  FormSelect,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import {
  createCategorySchema,
  type CreateCategorySchemaInput,
  type CreateCategorySchemaType,
} from "@/features/create-category/model/schema";
import { useUpdateCategory } from "../api/use-update-category";

const categoryTypeOptions = [
  { value: "INCOME", label: getCategoryTypeLabel("INCOME") },
  { value: "EXPENSE", label: getCategoryTypeLabel("EXPENSE") },
] as const;

type UpdateCategorySheetProps = {
  category: UserCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateCategorySheet({
  category,
  open,
  onOpenChange,
}: UpdateCategorySheetProps) {
  const { data: presets, isLoading: isPresetsLoading } =
    useGetCategoryPresets();
  const { mutate, isPending, error } = useUpdateCategory(category.id);

  const form = useForm<CreateCategorySchemaInput>({
    defaultValues: {
      name: category.name,
      type: category.type,
      iconKey: (category.iconKey ?? undefined) as CategoryIconKey | undefined,
      colorKey: (category.colorKey ?? undefined) as CategoryColorKey | undefined,
    },
    resolver: zodResolver(createCategorySchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: category.name,
      type: category.type,
      iconKey: (category.iconKey ?? undefined) as CategoryIconKey | undefined,
      colorKey: (category.colorKey ?? undefined) as CategoryColorKey | undefined,
    });
  }, [category, form, open]);

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  const selectedIconKey = useWatch({ control: form.control, name: "iconKey" });
  const selectedColorKey = useWatch({
    control: form.control,
    name: "colorKey",
  });

  const iconEntries = useMemo(() => {
    const group = presets?.icons[selectedType];
    if (!group) return [];

    return Object.entries(group).map(([key, value]) => ({
      key: key as CategoryIconKey,
      label: value.label,
    }));
  }, [presets, selectedType]);

  const onSubmit = (values: CreateCategorySchemaInput) => {
    const dto: CreateCategorySchemaType = createCategorySchema.parse(values);

    mutate(dto, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Изменить категорию</SheetTitle>
          <SheetDescription>
            Обнови название, тип, цвет и иконку категории.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput
            control={form.control}
            name="name"
            label="Название"
            placeholder="Например: Продукты"
          />

          <FormSelect
            control={form.control}
            name="type"
            label="Тип"
            id={`update-category-type-${category.id}`}
            placeholder="Выберите тип"
            options={[...categoryTypeOptions]}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Цвет</p>
            <ColorPicker
              colors={CATEGORY_COLORS}
              value={selectedColorKey as CategoryColorKey}
              onChange={(key) => {
                form.setValue("colorKey", key, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Иконка</p>
            <IconPicker
              value={selectedIconKey as CategoryIconKey}
              onChange={(key) => {
                form.setValue("iconKey", key, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              items={iconEntries}
              color={selectedColorKey as CategoryColorKey}
            />
          </div>

          {error instanceof Error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}

          <SheetFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedColorKey ||
                !selectedIconKey ||
                isPresetsLoading ||
                !presets ||
                isPending
              }
            >
              {isPending ? "Сохраняю..." : "Сохранить"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
