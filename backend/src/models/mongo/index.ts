/**
 * File: models/mongo/index.ts
 * Mục đích: Export tất cả MongoDB models
 */

export { default as PostDetail } from "./PostDetail.js";
export { default as Message } from "./Message.js";

// Export types
export * from "./PostDetail.js";
export * from "./Message.js";
