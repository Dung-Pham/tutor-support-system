import api from "./api";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/signin", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/signout");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  },

  async getMe(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>("/users/me");
    return response.data;
  },

  async verifyAdmin(): Promise<boolean> {
    try {
      const response = await this.getMe();
      return response.user?.role === "admin";
    } catch {
      return false;
    }
  },
};
