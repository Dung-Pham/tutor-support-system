export interface StatsData {
  totalUsers: number;
  totalPosts: number;
  pendingPosts: number;
  rejectedPosts: number;
  approvedPosts: number;
  activeUsers: number;
  newUsersToday: number;
  newPostsToday: number;
  totalComments?: number;
  newUsersThisMonth?: number;
  postsThisMonth?: number;
  userGrowth?: number;
  postGrowth?: number;
  usersByRole?: { role: string; count: number }[];
  recentUsers?: Array<{
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    createdAt: string;
    isActive: boolean;
  }>;
  recentPosts?: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    viewCount: number;
    author?: {
      id: string;
      displayName: string;
      avatarUrl?: string;
    };
  }>;
}

export interface StatsResponse {
  success: boolean;
  message?: string;
  data: StatsData;
}

export interface ChartDataPoint {
  date: string;
  posts: number;
  users: number;
}

export interface TopPost {
  id: string;
  title: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface TopPostsResponse {
  success: boolean;
  data: TopPost[];
}

export interface ChartDataResponse {
  success: boolean;
  data: ChartDataPoint[];
}
