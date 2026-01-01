import api from "./api";
import type { UsersResponse, User } from "@/types/user";

export const userService = {
  /**
   * Lấy danh sách tất cả users với pagination
   * Route: GET /api/admin/users
   */
  async getUsers(
    params: {
      page?: number;
      limit?: number;
      role?: string;
      isActive?: string;
      search?: string;
    } = {}
  ): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>("/admin/users", { params });
    return response.data;
  },

  /**
   * Lấy thông tin user theo ID
   * Route: GET /api/admin/users/:id
   */
  async getUserById(id: string): Promise<{ success: boolean; data: User }> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Cập nhật user (role, status, etc.)
   * Route: PATCH /api/admin/users/:id
   */
  async updateUser(
    id: string,
    data: { isActive?: boolean; role?: string }
  ): Promise<{ success: boolean; message: string; data: User }> {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Xóa/Deactivate user
   * Route: DELETE /api/admin/users/:id
   */
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};
