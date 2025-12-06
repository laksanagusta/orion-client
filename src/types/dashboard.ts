/**
 * Dashboard types matching JPL Certificate Service API
 */

export interface DashboardStats {
  total_certificates: number;
  total_jpl: number;
  verified_certificates: number;
  pending_verification: number;
  by_type: {
    type: string;
    count: number;
    total_jpl: number;
  }[];
  by_quarter: {
    quarter: number;
    count: number;
    total_jpl: number;
  }[];
  monthly_progress: {
    month: string;
    total_jpl: number;
  }[];
  year: number;
}

export interface DashboardStatsParams {
  year: number;
  user_id?: string;
}

export interface DashboardStatsResponse {
  data: DashboardStats;
}
