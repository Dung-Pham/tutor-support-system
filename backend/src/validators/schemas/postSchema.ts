// Post Validation Schemas

import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string({ message: "Tiêu đề là bắt buộc" })
    .min(1, "Tiêu đề không được để trống")
    .max(500, "Tiêu đề tối đa 500 ký tự"),
  contentJson: z
    .record(z.string(), z.unknown())
    .refine((val) => Object.keys(val).length > 0, {
      message: "Nội dung không được để trống",
    }),
  status: z.enum(["draft", "pending"]).optional().default("draft"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(500, "Tiêu đề tối đa 500 ký tự")
    .optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const rejectPostSchema = z.object({
  reason: z
    .string({ message: "Lý do từ chối là bắt buộc" })
    .min(1, "Lý do từ chối không được để trống")
    .max(1000, "Lý do tối đa 1000 ký tự"),
});

export type RejectPostInput = z.infer<typeof rejectPostSchema>;

// ==========================================
// PAGINATION SCHEMA
// ==========================================
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1).max(100)),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
