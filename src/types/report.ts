export interface ReportSummary {
  total_certificates: number;
  total_jpl_hours: number;
  total_employees: number;
  average_jpl_per_employee: number;
  target_achievement_rate: number;
  yearly_target: number;
  quarterly_target: number;
  year: number;
  quarter: number | null;
}

export interface EmployeePerformance {
  rank: number;
  user_id: string;
  employee_id: string;
  full_name: string;
  email: string;
  total_jpl: number;
  target: number;
  progress: number;
  status: 'achieved' | 'on_track' | 'lagging';
}

export interface AtRiskEmployee {
  user_id: string;
  employee_id: string;
  full_name: string;
  current_jpl: number;
  target: number;
  shortage: number;
  days_remaining: number;
}

export interface TrendData {
  period: string; // Month name or Quarter name
  jpl: number;
  certificates: number;
}

export interface DistributionData {
  name: string;
  value: number;
  percentage?: number;
}

export interface VerificationStatus {
  total_certificates: number;
  verified: number;
  pending_verification: number;
  verification_rate: number;
}

export interface ManagerReportData {
  summary: ReportSummary;
  employee_performance: EmployeePerformance[];
  at_risk_employees: AtRiskEmployee[];
  monthly_trend: TrendData[];
  quarterly_trend: TrendData[];
  training_distribution: DistributionData[];
  verification_status: VerificationStatus;
  top_institutions: DistributionData[];
  top_trainings: DistributionData[];
  report_metadata: {
    generated_at: string;
    report_period: string;
    data_as_of: string;
  };
}

export interface ReportResponse {
  success: boolean;
  message: string;
  data: ManagerReportData;
}

export interface ReportParams {
  year?: number;
  quarter?: number;
  organization_id?: string;
  limit?: number;
}
