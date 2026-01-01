import type { User } from './user';
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RegisterTutorRequest extends RegisterStudentRequest {
  subject?: string;
  qualifications?: string;
}

export type RegisterRequest = RegisterStudentRequest | RegisterTutorRequest;

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginResponse extends AuthTokenResponse {
  user: User;
}

export interface RegisterResponse extends AuthTokenResponse {
  user: User;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}
