import { apiClient } from "./api";
import { getApiUrl } from "../lib/config";
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
  },

  /**
   * Get the URL for exporting Excel report
   * Downloads a file from /api/v1/reports/export-excel?year={year}
   */
  getExportExcelUrl: (year: number): string => {
    const baseUrl = getApiUrl();
    return `${baseUrl}/api/v1/reports/export-excel?year=${year}`;
  },

  /**
   * Export Excel report with authentication
   * This downloads the file using fetch with auth headers
   */
  exportExcel: async (year: number): Promise<void> => {
    const baseUrl = getApiUrl();
    const token = localStorage.getItem("token");
    
    const response = await fetch(`${baseUrl}/api/v1/reports/export-excel?year=${year}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export Excel');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `laporan-jpl-${year}.xlsx`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
