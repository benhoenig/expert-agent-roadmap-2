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

export interface KPI extends BaseItem {
  id: number;
  created_at: string;
  kpi_name: string;
  kpi_type: 'Action' | 'Skillset';
}

export interface CreateKPIRequest {
  kpi_name: string;
  kpi_type: 'Action' | 'Skillset';
}

export interface UpdateKPIRequest {
  kpi_name?: string;
  kpi_type?: 'Action' | 'Skillset';
}

class KPIService {
  /**
   * Get all KPI records
   */
  async getAllKPIs(): Promise<KPI[]> {
    try {
      console.log('Fetching all KPIs');
      
      const response = await retryRequest(async () => {
        return await xanoApi.get('/kpi');
      });
      
      console.log('KPIs fetched successfully:', response.data);
      // Map the response to include the name property required by BaseItem
      return response.data.map((kpi: any) => ({
        ...kpi,
        name: kpi.kpi_name // Map kpi_name to name for BaseItem compatibility
      }));
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  }

  /**
   * Get a KPI by ID
   */
  async getKPIById(kpiId: number): Promise<KPI> {
    try {
      console.log(`Fetching KPI with ID ${kpiId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.get(`/kpi/${kpiId}`);
      });
      
      console.log('KPI fetched successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.kpi_name // Map kpi_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error fetching KPI with ID ${kpiId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new KPI
   */
  async createKPI(kpiData: CreateKPIRequest): Promise<KPI> {
    try {
      console.log('Creating new KPI with data:', kpiData);
      
      const response = await retryRequest(async () => {
        return await xanoApi.post('/kpi', kpiData);
      });
      
      console.log('KPI created successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.kpi_name // Map kpi_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error('Error creating KPI:', error);
      throw error;
    }
  }

  /**
   * Update an existing KPI
   */
  async updateKPI(kpiId: number, kpiData: UpdateKPIRequest): Promise<KPI> {
    try {
      console.log(`Updating KPI with ID ${kpiId} with data:`, kpiData);
      console.log(`API endpoint: /kpi/${kpiId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.patch(`/kpi/${kpiId}`, kpiData);
      });
      
      console.log('Update KPI response:', response.data);
      
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.kpi_name // Map kpi_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error updating KPI with ID ${kpiId}:`, error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  /**
   * Delete a KPI
   */
  async deleteKPI(kpiId: number): Promise<void> {
    try {
      await retryRequest(async () => {
        return await xanoApi.delete(`/kpi/${kpiId}`);
      });
    } catch (error) {
      console.error(`Error deleting KPI with ID ${kpiId}:`, error);
      throw error;
    }
  }
}

export const kpiService = new KPIService(); 