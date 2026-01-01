export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  };
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
