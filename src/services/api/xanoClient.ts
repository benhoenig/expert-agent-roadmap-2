import axios, { AxiosRequestConfig, AxiosError } from "axios";

// Xano API configuration
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

// Helper function to get the token from storage
export const getAuthToken = () => {
  // Check localStorage first, then sessionStorage
  return localStorage.getItem("xano_token") || sessionStorage.getItem("xano_token") || null;
};

// Create an axios instance with the base URL
export const xanoApi = axios.create({
  baseURL: XANO_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
xanoApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Utility to handle and format API errors
 * @param error The error to process
 * @param context Additional context about where the error occurred
 * @returns Formatted error object with useful information
 */
export const formatApiError = (error: unknown, context: string): { 
  message: string;
  status?: number;
  data?: any;
  isNetworkError: boolean;
  isTimeout: boolean;
  originalError: unknown;
} => {
  // Default error response
  const result = {
    message: 'An unknown error occurred',
    status: undefined as number | undefined,
    data: undefined as any,
    isNetworkError: false,
    isTimeout: false,
    originalError: error
  };
  
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Check for timeout
    if (axiosError.code === 'ECONNABORTED') {
      result.message = 'Request timed out';
      result.isTimeout = true;
    }
    // Check for network errors
    else if (!axiosError.response) {
      result.message = 'Network error occurred';
      result.isNetworkError = true;
    }
    // Handle HTTP errors
    else {
      result.status = axiosError.response.status;
      result.data = axiosError.response.data;
      
      switch (axiosError.response.status) {
        case 401:
          result.message = 'Authentication failed';
          break;
        case 403:
          result.message = 'Permission denied';
          break;
        case 404:
          result.message = 'Resource not found';
          break;
        case 500:
          result.message = 'Server error';
          break;
        default:
          const responseData = axiosError.response.data as any;
          result.message = responseData?.message || 
                           `Error ${axiosError.response.status}: ${axiosError.message}`;
      }
    }
  }
  // Handle non-Axios errors
  else if (error instanceof Error) {
    result.message = error.message;
  }
  
  return result;
};

/**
 * Wrapper for try/catch blocks with consistent error handling
 * @param fn The async function to execute
 * @param errorContext Context for error logging
 * @returns Result of the function or throws a standardized error
 */
export const tryCatchWrapper = async <T>(fn: () => Promise<T>, errorContext: string): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const formattedError = formatApiError(error, errorContext);
    console.error(`[API Error] ${errorContext}:`, formattedError);
    throw new Error(formattedError.message);
  }
};

// Simple cache implementation for API requests
interface CacheItem {
  data: any;
  expiry: number;
}

export class ApiCache {
  cache: Map<string, CacheItem>;
  defaultTTL: number; // Default time to live in milliseconds

  constructor(defaultTTL = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if the item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl || this.defaultTTL)
    });
  }

  invalidate(pattern: string): void {
    if (!pattern) return;

    // If pattern is exact key, delete it
    if (this.cache.has(pattern)) {
      this.cache.delete(pattern);
      return;
    }

    // Otherwise, treat as prefix pattern
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Initialize the API cache
export const apiCache = new ApiCache();

/**
 * Makes an API request with caching support
 * @param method HTTP method
 * @param url API endpoint URL
 * @param data Request data (params for GET, body for POST/PUT)
 * @param options Additional options
 * @returns API response
 */
export const makeApiRequest = async (
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  data?: any,
  options?: {
    useCache?: boolean;
    cacheTTL?: number;
    forceRefresh?: boolean;
  }
): Promise<any> => {
  const {
    useCache = true,
    cacheTTL = 300000, // 5 minutes default
    forceRefresh = false,
  } = options || {};

  const cacheKey = `${method}:${url}:${JSON.stringify(data || {})}`;

  // Return cached data if available and not forcing refresh
  if (useCache && !forceRefresh && apiCache.get(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    let response;
    const config: AxiosRequestConfig = {
      timeout: 15000, // 15 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Handle different HTTP methods
    switch (method) {
      case 'get':
        response = await xanoApi.get(url, { params: data, ...config });
        break;
      case 'post':
        response = await xanoApi.post(url, data, config);
        break;
      case 'put':
        response = await xanoApi.put(url, data, config);
        break;
      case 'patch':
        response = await xanoApi.patch(url, data, config);
        break;
      case 'delete':
        response = await xanoApi.delete(url, { data, ...config });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // Cache the response if caching is enabled
    if (useCache) {
      apiCache.set(cacheKey, response.data, cacheTTL);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        console.error(`[API Request Timeout] ${method.toUpperCase()} ${url} timed out`);
        throw new Error('Request timeout. Please try again.');
      }
      
      if (!error.response) {
        console.error(`[API Network Error] ${method.toUpperCase()} ${url} - Network error:`, error.message);
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      console.error(
        `[API Error] ${method.toUpperCase()} ${url} - Status: ${error.response?.status}`,
        error.response?.data || error.message
      );
      
      // Handle specific HTTP status codes
      switch (error.response?.status) {
        case 401:
          throw new Error('Authentication error. Please log in again.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error('The requested resource was not found.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(error.response?.data?.message || 'Something went wrong with the request.');
      }
    }
    
    // For non-Axios errors
    console.error(`[API Unknown Error] ${method.toUpperCase()} ${url}:`, error);
    throw error;
  }
}; 