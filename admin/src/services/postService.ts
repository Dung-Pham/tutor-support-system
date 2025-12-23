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

  async getPendingPosts(
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>("/posts/pending", { params });
    return response.data;
  },

  async getRejectedPosts(
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>("/posts/rejected", {
      params,
    });
    return response.data;
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

  async rejectPost(
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string; data: Post }> {
    const response = await api.patch(`/posts/${id}/reject`, {
      rejectionReason: reason,
    });
    return response.data;
  },

  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};
