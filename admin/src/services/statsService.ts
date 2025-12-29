import api from "./api";
import type {
  StatsResponse,
  ChartDataResponse,
  TopPostsResponse,
} from "@/types/stats";

export const statsService = {
  async getStats(): Promise<StatsResponse> {
    const response = await api.get<StatsResponse>("/admin/stats");
    return response.data;
  },

  async getChartData(days: number = 30): Promise<ChartDataResponse> {
    const response = await api.get<ChartDataResponse>("/admin/chart", {
      params: { days },
    });
    return response.data;
  },

  async getTopPosts(): Promise<TopPostsResponse> {
    const response = await api.get<TopPostsResponse>("/admin/top-posts");
    return response.data;
  },
};
