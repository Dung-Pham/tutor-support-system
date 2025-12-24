/**
 * File: validators/schemas/authSchema.ts
 * Mục đích: Zod schemas cho authentication
 */

import { z } from "zod";

// ==========================================
// REGISTER SCHEMAS
// ==========================================
export const registerSchema = z.object({
  email: z
    .string({ message: "Email là bắt buộc" })
    .email("Email không hợp lệ")
    .max(255, "Email tối đa 255 ký tự"),
  password: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .max(100, "Mật khẩu tối đa 100 ký tự"),
  firstName: z
    .string({ message: "Họ là bắt buộc" })
    .min(1, "Họ không được để trống")
    .max(100, "Họ tối đa 100 ký tự"),
  lastName: z
    .string({ message: "Tên là bắt buộc" })
    .min(1, "Tên không được để trống")
    .max(100, "Tên tối đa 100 ký tự"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ==========================================
// SIGN IN SCHEMAS
// ==========================================
export const signInSchema = z.object({
  email: z.string({ message: "Email là bắt buộc" }).email("Email không hợp lệ"),
  password: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(1, "Mật khẩu không được để trống"),
});

export type SignInInput = z.infer<typeof signInSchema>;
