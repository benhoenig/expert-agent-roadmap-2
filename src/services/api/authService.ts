import { tryCatchWrapper, makeApiRequest } from './xanoClient';

/**
 * Authentication service for user signup, login, and session management
 */
export const authService = {
  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Authentication response with token
   */
  signup: async (userData: {
    username: string;
    email: string;
    password: string;
    nickname?: string;
    full_name?: string;
    role: string;
  }) => {
    return tryCatchWrapper(async () => {
      console.log("Signup request payload:", userData);
      
      const data = await makeApiRequest('post', '/auth/signup', userData, { useCache: false });
      
      // Validate the response contains the expected data
      if (!data || !data.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      
      // Store the auth token in localStorage by default for signup
      localStorage.setItem("xano_token", data.authToken);
      return data;
    }, "Error during signup");
  },
  
  /**
   * Authenticate a user
   * @param credentials - Login credentials
   * @returns Authentication response with token
   */
  login: async (credentials: { username: string; password: string }) => {
    return tryCatchWrapper(async () => {
      // Use the credentials directly as they are
      console.log("Login request payload:", { username: credentials.username, password: "********" });
      
      const data = await makeApiRequest('post', '/auth/login', credentials, { useCache: false });
      console.log("Login response:", data);
      
      if (!data || !data.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      
      // Token storage is handled in the component based on "Remember Me" checkbox
      return data;
    }, "Error during login");
  },
  
  /**
   * Log out the current user by removing auth tokens
   */
  logout: () => {
    // Clear token from both storage locations
    localStorage.removeItem("xano_token");
    sessionStorage.removeItem("xano_token");
  },
  
  /**
   * Get current authenticated user data
   * @returns Current user data
   */
  getUserData: async () => {
    return tryCatchWrapper(async () => {
      // This endpoint should return the current user's data based on the auth token
      const data = await makeApiRequest('get', '/auth/me', null, { forceRefresh: true });
      return data;
    }, "Error fetching current user data");
  }
}; 