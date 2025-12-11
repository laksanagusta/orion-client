export interface Organization {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface OrganizationResponse {
  data: Organization[];
}
