/**
 * API utility wrapper
 * 
 * This file provides a compatibility layer for any code that might be using this
 * API client. Instead of connecting to localhost:8080, it redirects all requests
 * to use the centralized makeApiRequest function from xanoClient.ts.
 */

import { makeApiRequest } from '../services/api/xanoClient';

// Re-export the makeApiRequest function with the same interface
// but route all requests through the centralized client
export const api = {
  get: async (url: string, config?: any) => {
    const params = config?.params;
    const response = await makeApiRequest('get', url, params, {
      useCache: true,
      forceRefresh: false
    });
    return { data: response };
  },
  
  post: async (url: string, data?: any, config?: any) => {
    const response = await makeApiRequest('post', url, data, {
      useCache: false
    });
    return { data: response };
  },
  
  put: async (url: string, data?: any, config?: any) => {
    const response = await makeApiRequest('put', url, data, {
      useCache: false
    });
    return { data: response };
  },
  
  delete: async (url: string, config?: any) => {
    const data = config?.data;
    const response = await makeApiRequest('delete', url, data, {
      useCache: false
    });
    return { data: response };
  },
  
  patch: async (url: string, data?: any, config?: any) => {
    const response = await makeApiRequest('patch', url, data, {
      useCache: false
    });
    return { data: response };
  }
};

// Helper function to handle API responses - maintained for compatibility
export const handleApiResponse = <T>(
  promise: Promise<any>,
  successCallback?: (data: T) => void,
  errorCallback?: (error: any) => void
): Promise<T> => {
  return promise
    .then((response) => {
      // Maintain the expected response format
      const data = response.data?.data || response.data;
      if (successCallback) {
        successCallback(data);
      }
      return data;
    })
    .catch((error) => {
      if (errorCallback) {
        errorCallback(error);
      }
      throw error;
    });
}; 