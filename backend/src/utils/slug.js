/**
 * Tạo slug từ tiêu đề: bỏ dấu, ký tự đặc biệt, chuẩn lowercase
 */
export function createSlug(title = "") {
  return String(title)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphen
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

export default createSlug;
