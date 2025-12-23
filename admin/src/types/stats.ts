export interface StatsData {
  totalUsers: number;
  totalPosts: number;
  pendingPosts: number;
  rejectedPosts: number;
  approvedPosts: number;
  activeUsers: number;
  newUsersToday: number;
  newPostsToday: number;
}

export interface StatsResponse {
  success: boolean;
  message: string;
  data: StatsData;
}
