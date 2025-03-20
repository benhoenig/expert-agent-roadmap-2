import axios, { AxiosRequestConfig, AxiosError, AxiosResponse, Method } from "axios";

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

  constructor(defaultTTL = 15 * 60 * 1000) { // Default 15 minutes (increased from 5 minutes)
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

  remove(key: string): void {
    this.cache.delete(key);
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

// Rate limit management (to prevent too many concurrent requests)
const rateLimiter = {
  queue: [] as { resolve: (value: any) => void; reject: (reason?: any) => void; fn: () => Promise<any> }[],
  running: 0,
  maxConcurrent: 1, // Reduced from 2 to 1 to be more conservative
  
  // Rate limit for batch of requests
  rateLimit: {
    count: 0,
    timestamp: 0,
    maxRequests: 5, // Reduced from 6 to 5 to stay well under the 10 requests/20s limit
    resetTime: 20000 // Match exactly to Xano's 20 seconds window
  },
  
  // Add function to queue
  enqueue: <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      rateLimiter.queue.push({ fn, resolve, reject });
      rateLimiter.processQueue();
    });
  },
  
  // Process queue items
  processQueue: () => {
    if (rateLimiter.queue.length === 0) return;
    
    // Check if we need to reset the rate limit counter
    const now = Date.now();
    if (now - rateLimiter.rateLimit.timestamp > rateLimiter.rateLimit.resetTime) {
      rateLimiter.rateLimit.count = 0;
      rateLimiter.rateLimit.timestamp = now;
    }
    
    // Check if we can run more requests (both concurrency and rate limits)
    if (rateLimiter.running < rateLimiter.maxConcurrent && 
        rateLimiter.rateLimit.count < rateLimiter.rateLimit.maxRequests) {
      
      const { fn, resolve, reject } = rateLimiter.queue.shift()!;
      rateLimiter.running++;
      rateLimiter.rateLimit.count++;
      
      console.log(`[Rate Limiter] Executing request ${rateLimiter.rateLimit.count}/${rateLimiter.rateLimit.maxRequests} in current window`);
      
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          rateLimiter.running--;
          setTimeout(() => rateLimiter.processQueue(), 2000); // Increased delay between requests to 2000ms
        });
      
      // Don't try to process another request immediately to avoid bursts
      if (rateLimiter.queue.length > 0) {
        setTimeout(() => rateLimiter.processQueue(), 2000); // Increased from 500ms to 2000ms
      }
    } else {
      // If rate limited, wait and try again later
      const delay = rateLimiter.rateLimit.count >= rateLimiter.rateLimit.maxRequests 
        ? rateLimiter.rateLimit.resetTime + 1000 // Wait for full reset time plus buffer if rate limited
        : 2000; // Increased delay to 2000ms
      
      console.log(`[Rate Limiter] Rate limit reached (${rateLimiter.rateLimit.count}/${rateLimiter.rateLimit.maxRequests}), waiting ${delay}ms`);
      setTimeout(() => rateLimiter.processQueue(), delay);
    }
  }
};

/**
 * Generate a cache key from method, url, and data
 */
export function generateCacheKey(method: string, url: string, data: any): string {
  const dataString = data ? JSON.stringify(data) : '';
  return `${method}:${url}:${dataString}`;
}

/**
 * Makes an API request with caching support
 * @param method HTTP method
 * @param url API endpoint URL
 * @param data Request data (params for GET, body for POST/PUT)
 * @param options Additional options
 * @returns API response
 */
export const makeApiRequest = async (
  method: Method,
  url: string,
  data?: any,
  options?: {
    useCache?: boolean;
    cacheTTL?: number;
    forceRefresh?: boolean;
    requiresAuth?: boolean;
  }
): Promise<any> => {
  const {
    useCache = true,
    cacheTTL = 15 * 60 * 1000, // 15 minutes default (increased from 5 minutes)
    forceRefresh = false,
    requiresAuth = true,
  } = options || {};

  // Check for auth token if endpoint requires authentication
  if (requiresAuth) {
    const token = getAuthToken();
    if (!token) {
      console.warn(`[API] No authentication token found for request to ${method.toUpperCase()} ${url}`);
      console.warn('[API] You may need to log in first or check localStorage/sessionStorage');
      
      // Optionally, mock the response for development
      if (process.env.NODE_ENV === 'development') {
        console.info('[API DEV] Using sample data for development');
        // Return empty array/object based on what's expected
        if (url.includes('/sales')) {
          return [];
        }
        return {};
      }
    } else {
      console.log(`[API] Using token for ${method.toUpperCase()} ${url}: ${token.substring(0, 10)}...`);
    }
  }

  const cacheKey = generateCacheKey(method, url, data || {});

  // Return cached data if available and not forcing refresh
  if (useCache && !forceRefresh && apiCache.get(cacheKey)) {
    console.log(`[API] Using cached data for ${method.toUpperCase()} ${url}`);
    return apiCache.get(cacheKey);
  }

  try {
    console.log(`[API] Making ${method.toUpperCase()} request to ${url}`, data || '');
    
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