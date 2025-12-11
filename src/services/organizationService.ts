import { getIdentityUrl } from "../lib/config";
import type { Organization, OrganizationResponse } from "../types/organization";

const IDENTITY_API_URL = getIdentityUrl();

export const organizationService = {
  /**
   * Get all organizations from Identity Service
   * GET /api/public/v1/organizations?limit=100&page=1
   */
  getOrganizations: async (): Promise<Organization[]> => {
    try {
      const response = await fetch(`${IDENTITY_API_URL}/api/public/v1/organizations?limit=100&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OrganizationResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      throw error;
    }
  },
};
