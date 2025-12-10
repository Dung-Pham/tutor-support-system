/**
 * File: types/user.ts
 * Mục đích: Định nghĩa tất cả types liên quan đến User
 */

/**
 * User roles trong hệ thống
 */
export type UserRole = 'student' | 'tutor' | 'admin';

/**
 * Thông tin cơ bản của User
 */
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  avatarId?: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Profile - Thông tin chi tiết của user
 */
export interface UserProfile extends User {
  stats?: {
    totalClasses?: number;
    totalStudents?: number;
    totalRatings?: number;
    averageRating?: number;
  };
}

/**
 * User Info - Thông tin hiển thị trong chat/list
 */
export interface UserInfo {
  _id: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
}

/**
 * Update User Request - Dữ liệu khi cập nhật profile
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  avatarId?: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
