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

export interface CodeOfHonor extends BaseItem {
  id: number;
  created_at: string;
  code_of_honor_name: string;
  explanation: string;
}

export interface CreateCodeOfHonorRequest {
  code_of_honor_name: string;
  explanation: string;
}

export interface UpdateCodeOfHonorRequest {
  code_of_honor_name?: string;
  explanation?: string;
}

class CodeOfHonorService {
  /**
   * Get all Code of Honor records
   */
  async getAllCodeOfHonors(): Promise<CodeOfHonor[]> {
    try {
      console.log('Fetching all Code of Honors');
      const response = await xanoApi.get('/code_of_honor');
      console.log('Code of Honors fetched successfully:', response.data);
      // Map the response to include the name property required by BaseItem
      return response.data.map((codeOfHonor: any) => ({
        ...codeOfHonor,
        name: codeOfHonor.code_of_honor_name // Map code_of_honor_name to name for BaseItem compatibility
      }));
    } catch (error) {
      console.error('Error fetching Code of Honors:', error);
      throw error;
    }
  }

  /**
   * Get a Code of Honor by ID
   */
  async getCodeOfHonorById(codeOfHonorId: number): Promise<CodeOfHonor> {
    try {
      console.log(`Fetching Code of Honor with ID ${codeOfHonorId}`);
      const response = await xanoApi.get(`/code_of_honor/${codeOfHonorId}`);
      console.log('Code of Honor fetched successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.code_of_honor_name // Map code_of_honor_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error fetching Code of Honor with ID ${codeOfHonorId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new Code of Honor
   */
  async createCodeOfHonor(codeOfHonorData: CreateCodeOfHonorRequest): Promise<CodeOfHonor> {
    try {
      console.log('Creating new Code of Honor with data:', codeOfHonorData);
      const response = await xanoApi.post('/code_of_honor', codeOfHonorData);
      console.log('Code of Honor created successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.code_of_honor_name // Map code_of_honor_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error('Error creating Code of Honor:', error);
      throw error;
    }
  }

  /**
   * Update an existing Code of Honor
   */
  async updateCodeOfHonor(codeOfHonorId: number, codeOfHonorData: UpdateCodeOfHonorRequest): Promise<CodeOfHonor> {
    try {
      console.log(`Updating Code of Honor with ID ${codeOfHonorId} with data:`, codeOfHonorData);
      console.log(`API endpoint: /code_of_honor/${codeOfHonorId}`);
      
      const response = await xanoApi.patch(`/code_of_honor/${codeOfHonorId}`, codeOfHonorData);
      console.log('Update Code of Honor response:', response.data);
      
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.code_of_honor_name // Map code_of_honor_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error updating Code of Honor with ID ${codeOfHonorId}:`, error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  /**
   * Delete a Code of Honor
   */
  async deleteCodeOfHonor(codeOfHonorId: number): Promise<void> {
    try {
      await xanoApi.delete(`/code_of_honor/${codeOfHonorId}`);
    } catch (error) {
      console.error(`Error deleting Code of Honor with ID ${codeOfHonorId}:`, error);
      throw error;
    }
  }
}

export const codeOfHonorService = new CodeOfHonorService(); 