import z from "zod/v3";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(4, "Пароль должен быть не менее 4 символов"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),

  password: z
    .string()
    .min(6, "Пароль должен быть минимум 6 символов")
    .max(100, "Пароль слишком длинный"),

  firstName: z
    .string()
    .min(1, "Имя обязательно")
    .max(50, "Имя слишком длинное"),

  lastName: z
    .string()
    .min(1, "Фамилия обязательна")
    .max(50, "Фамилия слишком длинная"),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
