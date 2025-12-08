import { ApiClient } from "./api";
import type { ReportResponse, ReportParams } from "../types/report";

const client = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:8080');

export const reportService = {
  getManagerReport: async (params?: ReportParams): Promise<ReportResponse> => {
    // Construct query string
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.quarter) queryParams.append('quarter', params.quarter.toString());
    if (params?.organization_id) queryParams.append('organization_id', params.organization_id);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return client.get<ReportResponse>(`/api/v1/reports/manager?${queryParams.toString()}`);
  }
};
