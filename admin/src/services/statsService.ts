import api from "./api";
import type { StatsResponse } from "@/types/stats";

export const statsService = {
  async getStats(): Promise<StatsResponse> {
    const response = await api.get<StatsResponse>("/admin/stats");
    return response.data;
  },
};
