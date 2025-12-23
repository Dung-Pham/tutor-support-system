import api from "./api";
import type { UsersResponse, User } from "@/types/user";

export const userService = {
  async getUsers(
    params: {
      page?: number;
      limit?: number;
      role?: string;
      isActive?: string;
      search?: string;
    } = {}
  ): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>("/users", { params });
    return response.data;
  },

  async getUserById(id: string): Promise<{ success: boolean; data: User }> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateUserStatus(
    id: string,
    isActive: boolean
  ): Promise<{ success: boolean; message: string; data: User }> {
    const response = await api.patch(`/users/${id}`, { isActive });
    return response.data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
