/**
 * Certificate types matching JPL Certificate Service API
 */

// Certificate entity from database
export interface Certificate {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  training_name: string;
  institution: string;
  certificate_number: string;
  year: number;
  start_date: string;
  end_date: string;
  jpl_hours: number;
  type: string;
  sub_type: string;
  is_verified: boolean;
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Certificate type with subtypes from /api/v1/certificates/types
export interface CertificateTypeItem {
  type: string;
  sub_types: string[];
}

export interface CertificateTypesResponse {
  data: {
    types: CertificateTypeItem[];
  };
}

// List certificates response with pagination
export interface CertificateListResponse {
  data: Certificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// List certificates params
export interface CertificateListParams {
  page?: number;
  limit?: number;
  year?: number;
  quarter?: number;
  type?: string;
  user_id?: string;
}

// Single certificate response
export interface CertificateResponse {
  data: Certificate;
}

// Extracted certificate data from AI
export interface ExtractedData {
  training_name?: string;
  institution?: string;
  certificate_number?: string;
  year?: number;
  start_date?: string;
  end_date?: string;
  jpl_hours?: number;
  type?: string;
  sub_type?: string;
}

// Extracted certificate from /api/v1/certificates/extract
export interface ExtractedCertificate {
  temp_id: string;
  file_name: string;
  file_url: string;
  extracted: ExtractedData;
  success: boolean;
}

export interface ExtractCertificatesResponse {
  data: {
    failed: number;
    results: ExtractedCertificate[];
    successful: number;
    total: number;
  };
}

// Batch save request body
export interface BatchSaveCertificateItem {
  temp_id: string;
  file_name: string;
  training_name: string;
  institution: string;
  certificate_number: string;
  year: number;
  start_date: string;
  end_date: string;
  jpl_hours: number;
  type: string;
  sub_type: string;
}

export interface BatchSaveRequest {
  save: BatchSaveCertificateItem[];
  discard: string[];
}

export interface BatchSaveResponse {
  data: {
    saved: Certificate[];
    discarded: string[];
  };
}

// Create certificate (manual) request - uses FormData
export interface CreateCertificateData {
  file: File;
  training_name: string;
  institution: string;
  certificate_number: string;
  year: number;
  start_date: string;
  end_date: string;
  jpl_hours: number;
  type: string;
  sub_type: string;
}

// Update certificate request
export interface UpdateCertificateData {
  training_name?: string;
  institution?: string;
  certificate_number?: string;
  year?: number;
  start_date?: string;
  end_date?: string;
  jpl_hours?: number;
  type?: string;
  sub_type?: string;
}

// Verify certificate request
export interface VerifyCertificateData {
  is_verified: boolean;
  verification_notes?: string;
}
