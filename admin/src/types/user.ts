export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  role: "student" | "tutor" | "admin";
  isActive: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
}

export interface UserFilters {
  role?: string;
  isActive?: string;
  search?: string;
}

export interface UsersResponse {
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
