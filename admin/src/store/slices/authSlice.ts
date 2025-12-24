import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import type { LoginCredentials } from "@/types/auth";

interface User {
  id: string;
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
  error: string | null;
}

// Restore auth state from localStorage on app init
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          return {
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          };
        }
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
  }

  return {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      if (!response.success || !response.user) {
        return rejectWithValue(response.message || "Login failed");
      }

      if (response.user.role !== "admin") {
        return rejectWithValue("Bạn không có quyền truy cập Admin Panel");
      }

      const token = response.token || "";
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(response.user));

      return { user: response.user, token };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for checking auth
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await authService.getMe();

      if (response.success && response.user && response.user.role === "admin") {
        localStorage.setItem("admin_user", JSON.stringify(response.user));
        return { user: response.user, token };
      } else {
        return rejectWithValue("Not authorized");
      }
    } catch {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      return rejectWithValue("Auth check failed");
    }
  }
);

// Async thunk for logout
export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem("admin_user", JSON.stringify(action.payload));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { setUser, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
