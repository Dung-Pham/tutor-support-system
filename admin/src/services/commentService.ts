import api from "./api";
import type { CommentsResponse, RepliesResponse } from "@/types/comment";

export const commentService = {
  /**
   * Lấy danh sách comments của một bài viết
   * Route: GET /api/posts/:postId/comments
   */
  async getComments(
    postId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<CommentsResponse> {
    const response = await api.get<CommentsResponse>(
      `/posts/${postId}/comments`,
      { params }
    );
    return response.data;
  },

  /**
   * Lấy danh sách replies của một comment
   * Route: GET /api/comments/:commentId/replies
   */
  async getReplies(
    commentId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<RepliesResponse> {
    const response = await api.get<RepliesResponse>(
      `/comments/${commentId}/replies`,
      { params }
    );
    return response.data;
  },

  /**
   * Xóa comment (admin)
   * Route: DELETE /api/comments/:commentId
   */
  async deleteComment(
    commentId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  /**
   * Xóa reply (admin)
   * Route: DELETE /api/replies/:replyId
   */
  async deleteReply(
    replyId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/replies/${replyId}`);
    return response.data;
  },
};
