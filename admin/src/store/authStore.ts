import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import type { LoginCredentials } from "@/types/auth";

interface User {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        try {
          const response = await authService.login(credentials);

          if (!response.success || !response.user) {
            throw new Error(response.message || "Login failed");
          }

          if (response.user.role !== "admin") {
            throw new Error("Bạn không có quyền truy cập Admin Panel");
          }

          const token = response.token || "";
          localStorage.setItem("admin_token", token);

          set({
            user: response.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("admin_token");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem("admin_token");

        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        try {
          const response = await authService.getMe();

          if (
            response.success &&
            response.user &&
            response.user.role === "admin"
          ) {
            set({
              user: response.user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error("Not authorized");
          }
        } catch {
          localStorage.removeItem("admin_token");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: "admin-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
