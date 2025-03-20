import axios, { AxiosRequestConfig, Method } from 'axios';
import { getAuthToken, xanoApi, apiCache, generateCacheKey } from './xanoClient';

// Shared promises for in-flight requests
const pendingRequests: Record<string, Promise<any>> = {};

/**
 * Utility to deduplicate API requests
 * This prevents multiple identical API calls from being made simultaneously
 * 
 * @param cacheKey A unique key for this request
 * @param makeRequest Function that returns a promise for the API request
 * @param options Configuration options
 * @returns Promise that resolves with the API response
 */
export const deduplicateRequest = async <T>(
  cacheKey: string,
  makeRequest: () => Promise<T>,
  options?: {
    forceRefresh?: boolean;
    cacheTTL?: number;
  }
): Promise<T> => {
  const { forceRefresh = false, cacheTTL = 15 * 60 * 1000 } = options || {};
  
  // Check if we have cached data
  if (!forceRefresh) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      console.log(`[API] Using cached data for ${cacheKey}`);
      return cachedData;
    }
  }
  
  // If there's already an in-flight request for this key, return that promise
  if (pendingRequests[cacheKey]) {
    console.log(`[API] Reusing in-flight request for ${cacheKey}`);
    return pendingRequests[cacheKey];
  }
  
  // Otherwise, make a new request and store its promise
  console.log(`[API] Making new request for ${cacheKey}`);
  try {
    // Create and store the promise
    pendingRequests[cacheKey] = makeRequest().then(response => {
      // Cache the result on success
      apiCache.set(cacheKey, response, cacheTTL);
      return response;
    });
    
    // Wait for the request to complete
    const response = await pendingRequests[cacheKey];
    
    // Return the result
    return response;
  } finally {
    // Clean up the pending request when done (success or failure)
    delete pendingRequests[cacheKey];
  }
};

/**
 * Makes an API request with caching support and enhanced debugging
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

  // Enhanced debugging for sales endpoints
  const isSalesEndpoint = url.includes('/sales');
  if (isSalesEndpoint) {
    console.log(`[DEBUG-API] Sales endpoint request: ${method.toUpperCase()} ${url}`);
    console.log(`[DEBUG-API] Request parameters:`, data);
  }

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
    if (isSalesEndpoint) {
      console.log(`[DEBUG-API] Sales endpoint using CACHED data`);
    }
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

    // Enhanced debugging for sales endpoints
    if (isSalesEndpoint) {
      const dataArray = Array.isArray(response.data);
      console.log(`[DEBUG-API] Sales endpoint response received: ${dataArray ? response.data.length + ' items' : 'Object'}`);
      
      if (dataArray && response.data.length > 0) {
        const firstItem = response.data[0];
        console.log(`[DEBUG-API] First item in response - ID: ${firstItem.id}, has user data: ${firstItem.user ? 'YES' : 'NO'}`);
        
        if (!firstItem.user && firstItem.user_id) {
          console.log(`[DEBUG-API] First item has user_id ${firstItem.user_id} but no joined user data`);
        }
      }
    }

    // Cache the response if caching is enabled
    if (useCache) {
      apiCache.set(cacheKey, response.data, cacheTTL);
    }

    return response.data;
  } catch (error) {
    // Debug API errors for sales endpoints
    if (isSalesEndpoint) {
      console.error(`[DEBUG-API] Sales endpoint error in ${method.toUpperCase()} ${url}:`, error);
    }
    
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