import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button, FormSelect } from "@/shared/ui";
import FormInput from "@/shared/ui/components/form-input";
import { useGetCategoryPresets } from "@/features/get-category-presets/api/use-get-presets";
import { useCreateCategory } from "../api/use-create-category";
import {
  createCategorySchema,
  type CreateCategorySchemaType,
} from "../model/schema";
import type { CreateCategoryDto } from "../model/types.api";
import { ColorPicker } from "@/features/category-picker/ui/color-picker";
import { IconPicker } from "@/features/category-picker/ui/icon-picker";
import { useMemo } from "react";
import type {
  CategoryColorKey,
  CategoryIconKey,
} from "@/features/get-category-presets/model/types.api";
import { CATEGORY_COLORS } from "@/shared/config/category-colors";

const categoryTypeOptions = [
  { value: "INCOME", label: "INCOME" },
  { value: "EXPENSE", label: "EXPENSE" },
] as const;

const CreateCategoryForm = () => {
  const { data: presets, isLoading: isPresetsLoading } =
    useGetCategoryPresets();
  const { mutate, isPending, error: createCategoryError } = useCreateCategory();

  const form = useForm<CreateCategorySchemaType>({
    defaultValues: {
      name: "",
      type: "EXPENSE",
      iconKey: undefined,
      colorKey: undefined,
    },
    resolver: zodResolver(createCategorySchema),
    mode: "onChange",
  });

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });

  const iconEntries = useMemo(() => {
    const group = presets?.icons[selectedType];
    if (!group) return [];

    return Object.entries(group).map(([key, v]) => ({
      key: key as CategoryIconKey,
      label: v.label,
    }));
  }, [presets, selectedType]);

  const selectedIconKey = useWatch({ control: form.control, name: "iconKey" });
  const selectedColorKey = useWatch({
    control: form.control,
    name: "colorKey",
  });

  const onSubmit = (values: CreateCategorySchemaType) => {
    if (isPending) return;

    const dto: CreateCategoryDto = {
      name: values.name,
      type: values.type,
      iconKey: values.iconKey as CreateCategoryDto["iconKey"],
      colorKey: values.colorKey as CreateCategoryDto["colorKey"],
    };

    mutate(dto, {
      onSuccess: () => {
        form.reset({
          name: "",
          type: values.type,
          iconKey: undefined,
          colorKey: undefined,
        });
      },
    });
  };

  return (
    <form
      className="rounded-lg border bg-card p-4 flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className=" gap-4 flex flex-wrap items-end">
        <FormInput
          control={form.control}
          name="name"
          label="Название"
          placeholder="Например: Продукты"
          containerClassName="md:col-span-2"
        />

        <FormSelect
          control={form.control}
          name="type"
          label="Тип"
          id="create-category-type"
          placeholder="Выберите тип"
          options={[...categoryTypeOptions]}
        />

        <div className="flex flex-row gap-6 h-fit ">
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
      </div>

      <div className="md:col-span-4">
        <Button
          type="submit"
          disabled={
            !form.watch("colorKey") ||
            !form.watch("iconKey") ||
            isPresetsLoading ||
            !presets
          }
        >
          {/* {isPending ? "Создаю..." : "Создать категорию"} */}
          Создать категорию
        </Button>
      </div>

      {createCategoryError instanceof Error && (
        <p className="text-sm text-red-500 md:col-span-4">
          Ошибка создания: {createCategoryError.message}
        </p>
      )}
    </form>
  );
};

export default CreateCategoryForm;
