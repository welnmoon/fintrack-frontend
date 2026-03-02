import type { HTMLAttributes, HTMLInputTypeAttribute } from "react";
import type { FieldPath, FieldValues, Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { cn } from "@/shared/lib";
import { Input } from "./input";

type FormInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  textarea?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxLength?: number;
};

const textareaBaseClass =
  "flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const FormInput = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  textarea = false,
  rows = 3,
  disabled,
  className,
  containerClassName,
  autoComplete,
  inputMode,
  min,
  max,
  step,
  maxLength,
}: FormInputProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-1.5", containerClassName)}>
          <label className="text-sm font-medium">{label}</label>

          {textarea ? (
            <textarea
              name={field.name}
              value={(field.value as string | undefined) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              className={cn(
                textareaBaseClass,
                fieldState.error &&
                  "border-red-400 focus-visible:ring-red-400",
                className,
              )}
            />
          ) : (
            <Input
              name={field.name}
              value={(field.value as string | number | undefined) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              inputMode={inputMode}
              min={min}
              max={max}
              step={step}
              maxLength={maxLength}
              className={cn(
                fieldState.error &&
                  "border-red-400 focus-visible:ring-red-400",
                className,
              )}
            />
          )}

          {fieldState.error?.message && (
            <p className="text-xs text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
};

export default FormInput;
