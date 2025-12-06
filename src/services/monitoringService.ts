/**
 * Monitoring Service - API methods for JPL monitoring
 */
import { apiClient } from './api';
import type {
  JPLReportResponse,
  JPLReportParams,
  AtRiskEmployeesResponse,
  AtRiskEmployeesParams,
  SendAlertsRequest,
  SendAlertsResponse,
} from '../types/monitoring';

const ENDPOINT = '/api/v1/monitoring';

export const monitoringService = {
  /**
   * Get JPL report
   * GET /api/v1/monitoring/jpl-report
   */
  getJPLReport: async (params: JPLReportParams): Promise<JPLReportResponse> => {
    const queryParams: Record<string, string | number | undefined> = {
      year: params.year,
      quarter: params.quarter,
      user_id: params.user_id,
    };
    return apiClient.get<JPLReportResponse>(`${ENDPOINT}/jpl-report`, queryParams);
  },

  /**
   * Get at-risk employees list
   * GET /api/v1/monitoring/at-risk
   */
  getAtRiskEmployees: async (params: AtRiskEmployeesParams): Promise<AtRiskEmployeesResponse> => {
    const queryParams: Record<string, string | number | undefined> = {
      year: params.year,
      quarter: params.quarter,
    };
    return apiClient.get<AtRiskEmployeesResponse>(`${ENDPOINT}/at-risk`, queryParams);
  },

  /**
   * Send JPL alerts to at-risk employees
   * POST /api/v1/monitoring/send-alerts
   */
  sendAlerts: async (data: SendAlertsRequest): Promise<SendAlertsResponse> => {
    return apiClient.post<SendAlertsResponse>(`${ENDPOINT}/send-alerts`, data);
  },
};
