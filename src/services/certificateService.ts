/**
 * Certificate Service - API methods for certificate management
 */
import { apiClient } from './api';
import type {
  CertificateTypesResponse,
  CertificateListResponse,
  CertificateListParams,
  CertificateResponse,
  CreateCertificateData,
  ExtractCertificatesResponse,
  ExtractOnlyResponse,
  BatchSaveRequest,
  BatchSaveResponse,
  UpdateCertificateData,
  VerifyCertificateData,
  Certificate,
} from '../types/certificate';

const ENDPOINT = '/api/v1/certificates';

export const certificateService = {
  /**
   * Get certificate types and subtypes
   * GET /api/v1/certificates/types (no auth required)
   */
  getTypes: async (): Promise<CertificateTypesResponse> => {
    return apiClient.get<CertificateTypesResponse>(`${ENDPOINT}/types`, undefined, false);
  },

  /**
   * List certificates with pagination and filters
   * GET /api/v1/certificates
   */
  list: async (params?: CertificateListParams): Promise<CertificateListResponse> => {
    return apiClient.get<CertificateListResponse>(ENDPOINT, params as Record<string, string | number>);
  },

  /**
   * Get a single certificate by ID
   * GET /api/v1/certificates/:id
   */
  getById: async (id: string): Promise<CertificateResponse> => {
    return apiClient.get<CertificateResponse>(`${ENDPOINT}/${id}`);
  },

  /**
   * Create a certificate manually with file upload
   * POST /api/v1/certificates (formdata)
   */
  create: async (data: CreateCertificateData): Promise<CertificateResponse> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('training_name', data.training_name);
    formData.append('institution', data.institution);
    formData.append('certificate_number', data.certificate_number);
    formData.append('year', String(data.year));
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('jpl_hours', String(data.jpl_hours));
    formData.append('type', data.type);
    formData.append('sub_type', data.sub_type);

    return apiClient.postFormData<CertificateResponse>(ENDPOINT, formData);
  },

  /**
   * Extract certificate data from files using AI
   * POST /api/v1/certificates/extract (formdata with multiple files)
   */
  extract: async (files: File[]): Promise<ExtractCertificatesResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return apiClient.postFormData<ExtractCertificatesResponse>(`${ENDPOINT}/extract`, formData);
  },

  /**
   * Extract certificate data without storing files (extract-only mode)
   * POST /api/v1/certificates/extract-only (formdata with multiple files)
   */
  extractOnly: async (files: File[]): Promise<ExtractOnlyResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return apiClient.postFormData<ExtractOnlyResponse>(`${ENDPOINT}/extract-only`, formData);
  },

  /**
   * Batch save extracted certificates
   * POST /api/v1/certificates/batch
   */
  batchSave: async (data: BatchSaveRequest): Promise<BatchSaveResponse> => {
    return apiClient.post<BatchSaveResponse>(`${ENDPOINT}/batch`, data);
  },

  /**
   * Update a certificate
   * PATCH /api/v1/certificates/:id
   */
  update: async (id: string, data: UpdateCertificateData): Promise<CertificateResponse> => {
    return apiClient.patch<CertificateResponse>(`${ENDPOINT}/${id}`, data);
  },

  /**
   * Verify or reject a certificate
   * PATCH /api/v1/certificates/:id/verify
   */
  verify: async (id: string, data: VerifyCertificateData): Promise<CertificateResponse> => {
    return apiClient.patch<CertificateResponse>(`${ENDPOINT}/${id}/verify`, data);
  },

  /**
   * Delete a certificate
   * DELETE /api/v1/certificates/:id
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${ENDPOINT}/${id}`);
  },

  /**
   * Get preview URL for a certificate document
   * This returns a URL that can be used directly in an iframe or img tag
   * GET /api/v1/certificates/:id/preview
   */
  getPreviewUrl: (id: string): string => {
    const token = localStorage.getItem('token');
    const baseUrl = apiClient.getBaseUrl();
    // For preview, we need to pass token as query param since browser can't add headers
    return `${baseUrl}${ENDPOINT}/${id}/preview?token=${token}`;
  },

  /**
   * Get preview blob for a certificate document (fetches with auth header)
   * Returns a blob URL that can be used in img src or iframe
   * GET /api/v1/certificates/:id/preview
   */
  getPreviewBlob: async (id: string): Promise<{ blobUrl: string; contentType: string }> => {
    const token = localStorage.getItem('token');
    const baseUrl = apiClient.getBaseUrl();
    const url = `${baseUrl}${ENDPOINT}/${id}/preview`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch preview');
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, contentType };
  },

  /**
   * Download a certificate document
   * GET /api/v1/certificates/:id/download
   */
  download: async (id: string, filename?: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const baseUrl = apiClient.getBaseUrl();
    const url = `${baseUrl}${ENDPOINT}/${id}/download`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'certificate.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },
};

export type { Certificate };
