import { apiClient } from './api';
import type { User } from '@/types/user';

interface TutorsResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const userService = {
  /**
   * Lấy thông tin user hiện tại
   */
  getMe: async () => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/users/me');
    return response.data.data;
  },

  /**
   * Lấy danh sách tutors (cho students)
   */
  getTutors: async (page = 1, limit = 20) => {
    const response = await apiClient.get<TutorsResponse>('/users/tutors', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Lấy danh sách tất cả users (Admin only)
   */
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/users');
    return response.data.data;
  },

  /**
   * Lấy user theo ID (Admin only - dùng /admin/users)
   */
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/admin/users/${id}`);
    return response.data.data;
  },

  /**
   * Cập nhật status user (Admin only)
   */
  updateStatus: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch<{ success: boolean; data: User }>(`/users/${id}`, {
      isActive,
    });
    return response.data.data;
  },

  /**
   * Xóa/Deactivate user (Admin only - dùng /admin/users)
   */
  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
};
