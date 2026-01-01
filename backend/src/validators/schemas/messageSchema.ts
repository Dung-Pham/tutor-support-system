// Message Validation Schemas

import { z } from "zod";

const imgUrlsSchema = z
  .array(z.string().url("URL ảnh không hợp lệ"))
  .max(10, "Tối đa 10 ảnh mỗi tin nhắn")
  .optional();

export const sendDirectMessageSchema = z
  .object({
    recipientId: z
      .string({ message: "ID người nhận là bắt buộc" })
      .uuid("ID người nhận không hợp lệ"),
    conversationId: z
      .string()
      .uuid("ID cuộc hội thoại không hợp lệ")
      .optional(),
    content: z.string().max(10000, "Nội dung tối đa 10000 ký tự").optional(),
    imgUrls: imgUrlsSchema,
  })
  .refine((data) => data.content || (data.imgUrls && data.imgUrls.length > 0), {
    message: "Tin nhắn phải có nội dung hoặc hình ảnh",
  });

export type SendDirectMessageInput = z.infer<typeof sendDirectMessageSchema>;

export const sendGroupMessageSchema = z
  .object({
    conversationId: z
      .string({ message: "ID cuộc hội thoại là bắt buộc" })
      .uuid("ID cuộc hội thoại không hợp lệ"),
    content: z.string().max(10000, "Nội dung tối đa 10000 ký tự").optional(),
    imgUrls: imgUrlsSchema,
  })
  .refine((data) => data.content || (data.imgUrls && data.imgUrls.length > 0), {
    message: "Tin nhắn phải có nội dung hoặc hình ảnh",
  });

export type SendGroupMessageInput = z.infer<typeof sendGroupMessageSchema>;
