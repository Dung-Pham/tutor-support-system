import api from "./api";
import type { PostsResponse, Post } from "@/types/post";

export const postService = {
  async getApprovedPosts(
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>("/posts", { params });
    return response.data;
  },

  // Unified method to get posts by status (pending, rejected, deleted)
  async getPostsByStatus(
    status: "pending" | "rejected" | "deleted",
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>(`/posts/status/${status}`, {
      params,
    });
    return response.data;
  },

  // Backward compatible methods
  async getPendingPosts(
    params: { page?: number; limit?: number } = {}
  ): Promise<PostsResponse> {
    return this.getPostsByStatus("pending", params);
  },

  async getRejectedPosts(
    params: { page?: number; limit?: number } = {}
  ): Promise<PostsResponse> {
    return this.getPostsByStatus("rejected", params);
  },

  async getDeletedPosts(
    params: { page?: number; limit?: number } = {}
  ): Promise<PostsResponse> {
    return this.getPostsByStatus("deleted", params);
  },

  async getPostById(id: string): Promise<{ success: boolean; data: Post }> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  async approvePost(
    id: string
  ): Promise<{ success: boolean; message: string; data: Post }> {
    const response = await api.patch(`/posts/${id}/approve`);
    return response.data;
  },

  /**
   * Từ chối bài viết
   * Route: PATCH /api/posts/:id/reject
   */
  async rejectPost(
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string; data: Post }> {
    const response = await api.patch(`/posts/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  /**
   * Xóa bài viết (soft delete) - chỉ admin
   * Route: DELETE /api/posts/:id
   */
  async softDeletePost(
    id: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/posts/${id}`, {
      data: { reason },
    });
    return response.data;
  },

  // Backward compatible alias
  async deletePost(
    id: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.softDeletePost(id, reason);
  },

  /**
   * Khôi phục bài viết đã xóa
   * Route: PATCH /api/posts/:id/restore
   */
  async restorePost(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/posts/${id}/restore`);
    return response.data;
  },

  /**
   * Xóa vĩnh viễn bài viết
   * Route: DELETE /api/posts/:id/permanent
   */
  async hardDeletePost(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/posts/${id}/permanent`);
    return response.data;
  },
};
