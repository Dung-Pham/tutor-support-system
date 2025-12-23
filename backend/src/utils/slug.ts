/**
 * File: utils/slug.ts
 * Mục đích: Utility function tạo slug từ title
 */

export function createSlug(title: string = ""): string {
  return String(title)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default createSlug;
