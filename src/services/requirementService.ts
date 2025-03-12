import axios from "axios";
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
      const response = await xanoApi.get('/requirement');
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
      const response = await xanoApi.get(`/requirement/${requirementId}`);
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
      const response = await xanoApi.post('/requirement', requirementData);
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
      
      const response = await xanoApi.patch(`/requirement/${requirementId}`, requirementData);
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
      await xanoApi.delete(`/requirement/${requirementId}`);
    } catch (error) {
      console.error(`Error deleting Requirement with ID ${requirementId}:`, error);
      throw error;
    }
  }
}

export const requirementService = new RequirementService(); 