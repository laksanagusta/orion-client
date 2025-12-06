/**
 * Monitoring types matching JPL Certificate Service API
 */

export interface EmployeeJPLReport {
  user_id: string;
  employee_id: string;
  name: string;
  organization: string;
  total_jpl: number;
  target_jpl: number;
  progress_percentage: number;
  status: 'on_track' | 'at_risk' | 'below_target';
}

export interface JPLReportResponse {
  data: {
    year: number;
    quarter: number;
    employees: EmployeeJPLReport[];
    summary: {
      total_employees: number;
      on_track: number;
      at_risk: number;
      below_target: number;
    };
  };
}

export interface JPLReportParams {
  year: number;
  quarter: number;
  user_id?: string;
}

export interface AtRiskEmployee {
  user_id: string;
  employee_id: string;
  name: string;
  organization: string;
  current_jpl: number;
  target_jpl: number;
  deficit: number;
  email: string;
  phone_number?: string;
}

export interface AtRiskEmployeesResponse {
  data: {
    year: number;
    quarter: number;
    employees: AtRiskEmployee[];
    total_count: number;
  };
}

export interface AtRiskEmployeesParams {
  year: number;
  quarter: number;
}

export interface SendAlertsRequest {
  year: number;
  quarter: number;
}

export interface SendAlertsResponse {
  data: {
    sent_count: number;
    failed_count: number;
    details: {
      user_id: string;
      status: 'sent' | 'failed';
      error?: string;
    }[];
  };
}
