/**
 * Get runtime configuration
 * Priority:
 * 1. window.APP_CONFIG (runtime config from config.js)
 * 2. import.meta.env (build-time env vars)
 * 3. window.location.origin (fallback)
 */

declare global {
  interface Window {
    APP_CONFIG?: {
      API_URL?: string;
      IDENTITY_URL?: string;
    };
  }
}

export function getApiUrl(): string {
  // Priority 1: Runtime config
  if (window.APP_CONFIG?.API_URL) {
    return window.APP_CONFIG.API_URL;
  }
  
  // Priority 2: Build-time env var
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 3: Same origin fallback
  return window.location.origin;
}

export function getIdentityUrl(): string {
  // Priority 1: Runtime config
  if (window.APP_CONFIG?.IDENTITY_URL) {
    return window.APP_CONFIG.IDENTITY_URL;
  }
  
  // Priority 2: Build-time env var
  if (import.meta.env.VITE_IDENTITY_URL) {
    return import.meta.env.VITE_IDENTITY_URL;
  }
  
  // Priority 3: Same origin fallback
  return window.location.origin;
}
