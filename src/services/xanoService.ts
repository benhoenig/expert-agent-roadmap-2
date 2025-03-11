import axios from "axios";

// Xano API configuration
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

// Create an axios instance with the base URL
const xanoApi = axios.create({
  baseURL: XANO_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
xanoApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("xano_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API service functions
export const xanoService = {
  // Authentication
  signup: async (userData: {
    username: string;
    password: string;
    nickname?: string;
    full_name?: string;
    role: string;
  }) => {
    try {
      const response = await xanoApi.post("/auth/signup", userData);
      if (response.data.authToken) {
        localStorage.setItem("xano_token", response.data.authToken);
      }
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },
  
  login: async (credentials: { username: string; password: string }) => {
    try {
      const response = await xanoApi.post("/auth/login", credentials);
      if (response.data.authToken) {
        localStorage.setItem("xano_token", response.data.authToken);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  // User operations
  getUsers: async () => {
    try {
      const response = await xanoApi.get("/user");
      return response.data;
    } catch (error) {
      console.error("Get users error:", error);
      throw error;
    }
  },
  
  getUserById: async (id: number) => {
    try {
      const response = await xanoApi.get(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },
  
  // Test function to check if the API is working
  testConnection: async () => {
    try {
      const response = await xanoApi.get("/user");
      return {
        success: true,
        message: "Connection successful",
        data: response.data
      };
    } catch (error) {
      console.error("API connection test failed:", error);
      return {
        success: false,
        message: "Connection failed",
        error
      };
    }
  }
}; 