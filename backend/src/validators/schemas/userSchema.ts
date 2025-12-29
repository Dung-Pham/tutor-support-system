// User Validation Schemas

import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "Họ không được để trống")
    .max(100, "Họ tối đa 100 ký tự")
    .optional(),
  lastName: z
    .string()
    .min(1, "Tên không được để trống")
    .max(100, "Tên tối đa 100 ký tự")
    .optional(),
  displayName: z
    .string()
    .min(1, "Tên hiển thị không được để trống")
    .max(200, "Tên hiển thị tối đa 200 ký tự")
    .optional(),
  bio: z.string().max(1000, "Bio tối đa 1000 ký tự").optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Số điện thoại không hợp lệ")
    .max(20, "Số điện thoại tối đa 20 ký tự")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ message: "Trạng thái là bắt buộc" }),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

// ==========================================
// UUID PARAM SCHEMA
// ==========================================
export const uuidParamSchema = z.object({
  id: z.string().uuid("ID không hợp lệ"),
});

export type UuidParamInput = z.infer<typeof uuidParamSchema>;
