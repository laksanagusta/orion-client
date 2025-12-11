import { apiClient } from "./api";
import type { ReportResponse, ReportParams } from "../types/report";

export const reportService = {
  getManagerReport: async (params?: ReportParams): Promise<ReportResponse> => {
    const queryParams: Record<string, string | number | undefined> = {
      year: params?.year,
      quarter: params?.quarter,
      organization_id: params?.organization_id,
      limit: params?.limit,
    };

    return apiClient.get<ReportResponse>('/api/v1/reports/manager', queryParams);
  }
};
