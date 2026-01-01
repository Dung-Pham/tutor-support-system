import { apiClient } from './api';
import {
  CommentsResponse,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  RepliesResponse,
  ReplyResponse,
  CreateReplyRequest,
  LikeResponse,
  LikeStatusResponse,
} from '@/types/comment';

// ==================== COMMENT API ====================

/**
 * Lấy danh sách comment của bài viết
 */
export async function getComments(
  postId: string,
  page: number = 1,
  limit: number = 10
): Promise<CommentsResponse> {
  const response = await apiClient.get(`/posts/${postId}/comments`, {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Tạo comment mới
 */
export async function createComment(
  postId: string,
  data: CreateCommentRequest
): Promise<CommentResponse> {
  const response = await apiClient.post(`/posts/${postId}/comments`, data);
  return response.data;
}

/**
 * Cập nhật comment
 */
export async function updateComment(
  commentId: string,
  data: UpdateCommentRequest
): Promise<CommentResponse> {
  const response = await apiClient.patch(`/comments/${commentId}`, data);
  return response.data;
}

/**
 * Xóa comment
 */
export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
}

// ==================== REPLY API ====================

/**
 * Lấy danh sách reply của comment
 */
export async function getReplies(
  commentId: string,
  page: number = 1,
  limit: number = 10
): Promise<RepliesResponse> {
  const response = await apiClient.get(`/comments/${commentId}/replies`, {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Tạo reply mới
 */
export async function createReply(
  commentId: string,
  data: CreateReplyRequest
): Promise<ReplyResponse> {
  const response = await apiClient.post(`/comments/${commentId}/replies`, data);
  return response.data;
}

/**
 * Xóa reply
 */
export async function deleteReply(replyId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete(`/replies/${replyId}`);
  return response.data;
}

// ==================== LIKE COMMENT/REPLY API ====================

/**
 * Like/Unlike comment (toggle)
 */
export async function toggleCommentLike(commentId: string): Promise<LikeResponse> {
  const response = await apiClient.post(`/comments/${commentId}/like`);
  return response.data;
}

/**
 * Kiểm tra đã like comment chưa
 */
export async function checkCommentLike(commentId: string): Promise<LikeStatusResponse> {
  const response = await apiClient.get(`/comments/${commentId}/like`);
  return response.data;
}

/**
 * Like/Unlike reply (toggle)
 */
export async function toggleReplyLike(replyId: string): Promise<LikeResponse> {
  const response = await apiClient.post(`/replies/${replyId}/like`);
  return response.data;
}

/**
 * Kiểm tra đã like reply chưa
 */
export async function checkReplyLike(replyId: string): Promise<LikeStatusResponse> {
  const response = await apiClient.get(`/replies/${replyId}/like`);
  return response.data;
}
