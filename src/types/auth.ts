export interface User {
  id: string;
  employee_id: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role_ids?: string[]; // Optional as it might come as 'roles' object array
  roles?: { id: string; name: string }[]; // For populated roles
  organization_id?: string;
  organization?: { id: string; name: string }; // For populated organization
  avatar_url?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  employee_id: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role_ids: string[];
  organization_id: string;
}

export interface LoginResponse {
  token: string;
  user?: User; // User might not be returned in login response
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
