export type UserRole = 'student' | 'tutor' | 'admin';

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
  isActive?: boolean;
  lastSeenAt?: string;
  isOnline?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  stats?: {
    totalClasses?: number;
    totalStudents?: number;
    totalRatings?: number;
    averageRating?: number;
  };
}

export interface UserInfo {
  _id: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  avatarId?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
