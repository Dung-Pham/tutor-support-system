import { apiClient } from './api';
import { LikeResponse, LikeStatusResponse, PostLikesResponse } from '@/types/comment';

// ==================== POST LIKE API ====================

/**
 * Like/Unlike bài viết (toggle)
 */
export async function togglePostLike(postId: string): Promise<LikeResponse> {
  const response = await apiClient.post(`/posts/${postId}/like`);
  return response.data;
}

/**
 * Kiểm tra đã like bài viết chưa
 */
export async function checkPostLike(postId: string): Promise<LikeStatusResponse> {
  const response = await apiClient.get(`/posts/${postId}/like`);
  return response.data;
}

/**
 * Lấy danh sách user đã like bài viết
 */
export async function getPostLikes(
  postId: string,
  page: number = 1,
  limit: number = 20
): Promise<PostLikesResponse> {
  const response = await apiClient.get(`/posts/${postId}/likes`, {
    params: { page, limit },
  });
  return response.data;
}
