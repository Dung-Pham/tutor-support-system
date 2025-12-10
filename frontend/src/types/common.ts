/**
 * File: types/common.ts
 * Mục đích: Định nghĩa các types chung được sử dụng trên toàn ứng dụng
 */

/**
 * API Response chung - Success
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

/**
 * API Response - Error
 */
export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, any>;
}

/**
 * Pagination Info
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * File Upload Info
 */
export interface FileUploadInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  fileId?: string; // Cloudinary public_id
}

/**
 * Image Upload Info (từ Cloudinary)
 */
export interface CloudinaryImageInfo {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

/**
 * Notification Type
 */
export type NotificationType =
  | 'message'
  | 'friend_request'
  | 'friend_accepted'
  | 'class_update'
  | 'assignment'
  | 'system';

/**
 * Notification
 */
export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Toast Notification
 */
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * Sort Order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Query Params chung
 */
export interface CommonQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

/**
 * Online Status
 */
export type OnlineStatus = 'online' | 'offline' | 'away' | 'idle';

/**
 * User Presence
 */
export interface UserPresence {
  userId: string;
  status: OnlineStatus;
  lastActiveAt: string;
}
