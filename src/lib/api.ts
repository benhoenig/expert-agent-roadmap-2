import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens and redirect to login
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      // If we're in a browser environment, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session_expired=true';
      }
      
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data?.message || 'You do not have permission to perform this action');
    }
    
    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data?.message || 'The requested resource was not found');
    }
    
    // Handle 500 Internal Server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data?.message || 'An unexpected server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
export const handleApiResponse = <T>(
  promise: Promise<any>,
  successCallback?: (data: T) => void,
  errorCallback?: (error: any) => void
): Promise<T> => {
  return promise
    .then((response) => {
      const data = response.data.data;
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