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

export interface Rank extends BaseItem {
  id: number;
  created_at: string;
  rank_name: string;
  rank_level: number;
  manual_promotion: boolean;
  time_requirement_months: number;
}

export interface CreateRankRequest {
  rank_name: string;
  rank_level: number;
  manual_promotion: boolean;
  time_requirement_months: number;
}

export interface UpdateRankRequest {
  rank_name?: string;
  rank_level?: number;
  manual_promotion?: boolean;
  time_requirement_months?: number;
}

class RankService {
  /**
   * Get all Rank records
   */
  async getAllRanks(): Promise<Rank[]> {
    try {
      console.log('Fetching all Ranks');
      
      const response = await retryRequest(async () => {
        return await xanoApi.get('/rank');
      });
      
      console.log('Ranks fetched successfully:', response.data);
      // Map the response to include the name property required by BaseItem
      return response.data.map((rank: any) => ({
        ...rank,
        name: rank.rank_name // Map rank_name to name for BaseItem compatibility
      }));
    } catch (error) {
      console.error('Error fetching Ranks:', error);
      throw error;
    }
  }

  /**
   * Get a Rank by ID
   */
  async getRankById(rankId: number): Promise<Rank> {
    try {
      console.log(`Fetching Rank with ID ${rankId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.get(`/rank/${rankId}`);
      });
      
      console.log('Rank fetched successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.rank_name // Map rank_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error fetching Rank with ID ${rankId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new Rank
   */
  async createRank(rankData: CreateRankRequest): Promise<Rank> {
    try {
      console.log('Creating new Rank with data:', rankData);
      
      const response = await retryRequest(async () => {
        return await xanoApi.post('/rank', rankData);
      });
      
      console.log('Rank created successfully:', response.data);
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.rank_name // Map rank_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error('Error creating Rank:', error);
      throw error;
    }
  }

  /**
   * Update an existing Rank
   */
  async updateRank(rankId: number, rankData: UpdateRankRequest): Promise<Rank> {
    try {
      console.log(`Updating Rank with ID ${rankId} with data:`, rankData);
      console.log(`API endpoint: /rank/${rankId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.patch(`/rank/${rankId}`, rankData);
      });
      
      console.log('Update Rank response:', response.data);
      
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: response.data.rank_name // Map rank_name to name for BaseItem compatibility
      };
    } catch (error) {
      console.error(`Error updating Rank with ID ${rankId}:`, error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  /**
   * Delete a Rank
   */
  async deleteRank(rankId: number): Promise<void> {
    try {
      await retryRequest(async () => {
        return await xanoApi.delete(`/rank/${rankId}`);
      });
    } catch (error) {
      console.error(`Error deleting Rank with ID ${rankId}:`, error);
      throw error;
    }
  }
}

export const rankService = new RankService(); 