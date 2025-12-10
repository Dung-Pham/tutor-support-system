/**
 * File: types/auth.ts
 * Mục đích: Định nghĩa tất cả types liên quan đến Authentication
 */

import type { User } from './user';

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register Request - Student
 */
export interface RegisterStudentRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

/**
 * Register Request - Tutor
 */
export interface RegisterTutorRequest extends RegisterStudentRequest {
  subject?: string;
  qualifications?: string;
}

/**
 * Register Request - Combined
 */
export type RegisterRequest = RegisterStudentRequest | RegisterTutorRequest;

/**
 * Auth Token Response từ API
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * Login Response từ API
 */
export interface LoginResponse extends AuthTokenResponse {
  user: User;
}

/**
 * Register Response từ API
 */
export interface RegisterResponse extends AuthTokenResponse {
  user: User;
}

/**
 * Logout Request
 */
export interface LogoutRequest {
  refreshToken?: string;
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Auth State trong Redux
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Async Thunk Payload
 */
export interface SignInPayload {
  email: string;
  password: string;
}

/**
 * Verify Email Request
 */
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

/**
 * Forgot Password Request
 */
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
