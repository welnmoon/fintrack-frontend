import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/shared/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type FormSelectOption = {
  value: string;
  label: ReactNode;
};

type FormSelectProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: FormSelectOption[];
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
  valueFromField?: (value: unknown) => string;
  fieldFromValue?: (value: string) => unknown;
};

const FormSelect = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  id,
  placeholder,
  disabled,
  containerClassName,
  className,
  valueFromField,
  fieldFromValue,
}: FormSelectProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-1.5", containerClassName)}>
          <label className="text-sm font-medium" htmlFor={id}>
            {label}
          </label>
          <Select
            value={
              valueFromField
                ? valueFromField(field.value)
                : ((field.value as string | undefined) ?? "")
            }
            onValueChange={(value) =>
              field.onChange(fieldFromValue ? fieldFromValue(value) : value)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              className={cn(
                fieldState.error && "border-red-400 focus:ring-red-400",
                className,
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.error?.message && (
            <p className="text-xs text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
};

export default FormSelect;
