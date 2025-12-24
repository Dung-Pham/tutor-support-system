/**
 * File: validators/schemas/commentSchema.ts
 * Mục đích: Zod schemas cho comments
 */

import { z } from "zod";

// ==========================================
// COMMENT SCHEMAS
// ==========================================
export const createCommentSchema = z.object({
  comment_content: z
    .string({ message: "Nội dung bình luận là bắt buộc" })
    .min(1, "Nội dung bình luận không được để trống")
    .max(5000, "Nội dung tối đa 5000 ký tự"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  comment_content: z
    .string({ message: "Nội dung bình luận là bắt buộc" })
    .min(1, "Nội dung bình luận không được để trống")
    .max(5000, "Nội dung tối đa 5000 ký tự"),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// ==========================================
// REPLY SCHEMAS
// ==========================================
export const createReplySchema = z.object({
  reply_comment_content: z
    .string({ message: "Nội dung trả lời là bắt buộc" })
    .min(1, "Nội dung trả lời không được để trống")
    .max(5000, "Nội dung tối đa 5000 ký tự"),
});

export type CreateReplyInput = z.infer<typeof createReplySchema>;
