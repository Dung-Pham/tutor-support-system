/**
 * File: services/postService.ts
 * Mục đích: API calls liên quan đến post/blog feature
 */

import { apiClient } from './api';
import { CreatePostRequest, UpdatePostRequest, PostStatus } from '@/types/post';

/**
 * Lấy danh sách bài viết đã được duyệt (công khai)
 */
export async function getApprovedPosts(page: number = 1, limit: number = 10) {
  const response = await apiClient.get('/posts', {
    params: { page, limit, status: 'approved' },
  });
  return response.data;
}

/**
 * Lấy danh sách bài viết chờ duyệt (admin only)
 */
export async function getPendingPosts(page: number = 1, limit: number = 10) {
  const response = await apiClient.get('/posts/pending', {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Lấy chi tiết 1 bài viết
 */
export async function getPostDetail(id: string) {
  const response = await apiClient.get(`/posts/${id}`);
  // API trả về dạng { success, message, data: post }
  return response.data?.data || response.data;
}

/**
 * Tạo bài viết mới (draft hoặc pending)
 */
export async function createPost(data: CreatePostRequest) {
  const response = await apiClient.post('/posts', data);
  return response.data;
}

/**
 * Cập nhật bài viết (chỉ draft hoặc pending)
 */
export async function updatePost(id: string, data: UpdatePostRequest) {
  const response = await apiClient.patch(`/posts/${id}`, data);
  return response.data;
}

/**
 * Xóa bài viết (chỉ draft hoặc pending)
 */
export async function deletePost(id: string) {
  const response = await apiClient.delete(`/posts/${id}`);
  return response.data;
}

/**
 * Duyệt bài viết (admin only)
 */
export async function approvePost(id: string) {
  const response = await apiClient.patch(`/posts/${id}/approve`);
  return response.data;
}

/**
 * Từ chối bài viết (admin only)
 */
export async function rejectPost(id: string, reason: string) {
  const response = await apiClient.patch(`/posts/${id}/reject`, { reason });
  return response.data;
}

/**
 * Lấy bài viết của tutor hiện tại (với filter status)
 */
export async function getMyPosts(status?: PostStatus, page: number = 1, limit: number = 10) {
  const response = await apiClient.get('/posts/my', {
    params: { status, page, limit },
  });
  return response.data;
}

/**
 * Upload ảnh (trả về URL)
 * Note: Sẽ update để dùng UploadThing sau
 */
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
