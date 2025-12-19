import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export const userService = {
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/users');
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  },

  create: async (userData: Partial<User>) => {
    const response = await apiClient.post<{ success: boolean; data: User }>('/users', userData);
    return response.data.data;
  },

  update: async (id: string, userData: Partial<User>) => {
    const response = await apiClient.put<{ success: boolean; data: User }>(
      `/users/${id}`,
      userData
    );
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
