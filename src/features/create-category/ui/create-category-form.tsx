import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/shared/ui";
import { useGetCategoryPresets } from "@/features/get-category-presets/api/use-get-presets";
import { useCreateCategory } from "../api/use-create-category";
import {
  createCategorySchema,
  type CreateCategorySchemaInput,
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
import { getCategoryTypeLabel } from "@/entities/category/lib/category-type";

const categoryTypeOptions = [
  { value: "INCOME", label: getCategoryTypeLabel("INCOME") },
  { value: "EXPENSE", label: getCategoryTypeLabel("EXPENSE") },
] as const;

const CreateCategoryForm = () => {
  const { data: presets, isLoading: isPresetsLoading } =
    useGetCategoryPresets();
  const { mutate, isPending, error: createCategoryError } = useCreateCategory();

  const form = useForm<CreateCategorySchemaInput>({
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

  const onSubmit = (values: CreateCategorySchemaInput) => {
    if (isPending) return;

    const dto: CreateCategorySchemaType = createCategorySchema.parse(values);

    mutate(dto as CreateCategoryDto, {
      onSuccess: () => {
        form.reset({
          name: "",
          type: dto.type,
          iconKey: undefined,
          colorKey: undefined,
        });
      },
    });
  };

  return (
    <form
      className="overflow-hidden rounded-[14px] border border-[#DDD9D1] bg-white"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-[#EDEAE4] px-6 py-4">
        <span className="text-[13px] font-semibold text-[#111]">Новая категория</span>
        <span className="text-[11px] text-[#B5B0A8]">
          Задайте название, тип, цвет и иконку
        </span>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-[220px] flex-col gap-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#AAA49C]">
              Название
            </label>
            <input
              {...form.register("name")}
              type="text"
              placeholder="Например: Продукты"
              className="w-full rounded-[8px] border border-[#DDD9D1] bg-[#FAFAF8] px-3 py-2 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#C0BCB4] focus:border-[#AAA] focus:bg-white"
            />
            {form.formState.errors.name?.message ? (
              <p className="text-xs text-red-500">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="flex w-[120px] flex-col gap-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#AAA49C]">
              Тип
            </label>
            <select
              {...form.register("type")}
              className="w-full cursor-pointer appearance-none rounded-[8px] border border-[#DDD9D1] bg-[#FAFAF8] px-3 py-2 pr-7 text-[13px] text-[#333] outline-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23AAA49C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {categoryTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#AAA49C]">
              Цвет
            </label>
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
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[1.8px] text-[#AAA49C]">
            Иконка
          </label>
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
          {form.formState.errors.iconKey?.message ? (
            <p className="text-xs text-red-500">
              {form.formState.errors.iconKey.message}
            </p>
          ) : null}
          {form.formState.errors.colorKey?.message ? (
            <p className="text-xs text-red-500">
              {form.formState.errors.colorKey.message}
            </p>
          ) : null}
        </div>

        <div className="-mx-6 h-px bg-[#EDEAE4]" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="submit"
            disabled={
              !selectedColorKey ||
              !selectedIconKey ||
              isPresetsLoading ||
              !presets ||
              isPending
            }
            className="h-auto rounded-[8px] bg-[#111] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#333]"
          >
            {isPending ? "Создаю..." : "Создать категорию"}
          </Button>
          <span className="text-[11px] text-[#C0BCB4]">
            Категорию можно изменить в любой момент
          </span>
        </div>

        {createCategoryError instanceof Error && (
          <p className="text-sm text-red-500">
            Ошибка создания: {createCategoryError.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default CreateCategoryForm;
