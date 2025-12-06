/**
 * Dashboard Service - API methods for dashboard statistics
 */
import { apiClient } from './api';
import type {
  DashboardStatsResponse,
  DashboardStatsParams,
} from '../types/dashboard';

const ENDPOINT = '/api/v1/dashboard';

export const dashboardService = {
  /**
   * Get dashboard statistics
   * GET /api/v1/dashboard/stats
   */
  getStats: async (params: DashboardStatsParams): Promise<DashboardStatsResponse> => {
    const queryParams: Record<string, string | number | undefined> = {
      year: params.year,
      user_id: params.user_id,
    };
    return apiClient.get<DashboardStatsResponse>(`${ENDPOINT}/stats`, queryParams);
  },
};
