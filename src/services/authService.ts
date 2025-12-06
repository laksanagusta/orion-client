import { ApiClient } from "./api";
import type { LoginResponse, User, LoginRequest, RegisterRequest } from "../types/auth";

// Identity Service URL
const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_URL || 'http://localhost:5001';

// Create a specific client for Identity Service
const identityClient = new ApiClient(IDENTITY_API_URL);

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      // POST /api/public/v1/login
      const response = await identityClient.post<ApiResponse<{ token: string }>>(
        '/api/public/v1/login',
        credentials,
        false // No auth header needed for login
      );

      // Return token and empty user (user will be fetched via whoami)
      return {
        token: response.data.token,
      };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<void> => {
    try {
      // POST /api/public/v1/register
      await identityClient.post('/api/public/v1/register', data, false);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("token");
    // Optional: Call logout endpoint if exists
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      // GET /api/v1/users/whoami
      const response = await identityClient.get<ApiResponse<User>>('/api/v1/users/whoami');
      
      // Transform response if necessary (e.g., map roles)
      const user = response.data;
      
      // Ensure role_ids exists if only roles object is returned
      if (!user.role_ids && user.roles) {
        user.role_ids = user.roles.map(r => r.id);
      }

      return user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  },
};
