import axios, { AxiosError } from "axios";
import { BaseItem } from "../components/dashboard/tables/BaseTable";

// Xano API configuration
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

// Helper function to get the token from storage
const getAuthToken = () => {
  // Check localStorage first, then sessionStorage
  return localStorage.getItem("xano_token") || sessionStorage.getItem("xano_token") || null;
};

// Create an axios instance with the base URL
const xanoApi = axios.create({
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

// Helper function to retry API calls with exponential backoff
const retryRequest = async (apiCall: () => Promise<any>, maxRetries = 3): Promise<any> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        // Rate limit hit - wait and retry
        retries++;
        if (retries >= maxRetries) {
          throw error; // Max retries reached, rethrow the error
        }
        
        // Calculate exponential backoff delay (1s, 2s, 4s, etc.)
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Rate limit hit. Retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Not a rate limit error, rethrow immediately
        throw error;
      }
    }
  }
};

export interface Requirement extends BaseItem {
  id: number;
  created_at: string;
  requirement_name: string;
}

export interface CreateRequirementRequest {
  requirement_name: string;
}

export interface UpdateRequirementRequest {
  requirement_name?: string;
}

class RequirementService {
  /**
   * Get all Requirement records
   */
  async getAllRequirements(): Promise<Requirement[]> {
    try {
      console.log('Fetching all Requirements');
      
      const response = await retryRequest(async () => {
        return await xanoApi.get('/requirement');
      });
      
      console.log('Requirements fetched successfully:', response.data);
      // Map the response to include the name property required by BaseItem
      return response.data.map((requirement: any) => ({
        ...requirement,
        name: requirement.requirement_name // Map requirement_name to name for BaseItem compatibility
      }));
    } catch (error) {
      console.error('Error fetching Requirements:', error);
      throw error;
    }
  }

  /**
   * Get a Requirement by ID
   */
  async getRequirementById(requirementId: number): Promise<Requirement> {
    try {
      console.log(`Fetching Requirement with ID ${requirementId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.get(`/requirement/${requirementId}`);
      });
      
      console.log('Requirement fetched successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.requirement_name // Map requirement_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error fetching Requirement with ID ${requirementId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new Requirement
   */
  async createRequirement(requirementData: CreateRequirementRequest): Promise<Requirement> {
    try {
      console.log('Creating new Requirement with data:', requirementData);
      
      const response = await retryRequest(async () => {
        return await xanoApi.post('/requirement', requirementData);
      });
      
      console.log('Requirement created successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.requirement_name // Map requirement_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error('Error creating Requirement:', error);
      throw error;
    }
  }

  /**
   * Update an existing Requirement
   */
  async updateRequirement(requirementId: number, requirementData: UpdateRequirementRequest): Promise<Requirement> {
    try {
      console.log(`Updating Requirement with ID ${requirementId} with data:`, requirementData);
      console.log(`API endpoint: /requirement/${requirementId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.patch(`/requirement/${requirementId}`, requirementData);
      });
      
      console.log('Update Requirement response:', response.data);
      
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.requirement_name // Map requirement_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error updating Requirement with ID ${requirementId}:`, error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  /**
   * Delete a Requirement
   */
  async deleteRequirement(requirementId: number): Promise<void> {
    try {
      await retryRequest(async () => {
        return await xanoApi.delete(`/requirement/${requirementId}`);
      });
    } catch (error) {
      console.error(`Error deleting Requirement with ID ${requirementId}:`, error);
      throw error;
    }
  }
}

export const requirementService = new RequirementService(); 