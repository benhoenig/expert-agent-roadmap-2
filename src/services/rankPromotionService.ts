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

export interface RankPromotion extends BaseItem {
  id: number;
  created_at: string;
  rank_id: number;
  kpi_id: number;
  requirement_id: number;
  target_count_house: number;
  target_count_condo: number;
  minimum_skillset_score: number;
  timeframe_days: number;
  
  // These fields will be populated when we fetch with expanded relations
  rank_name?: string;
  kpi_name?: string;
  requirement_name?: string;
}

export interface CreateRankPromotionRequest {
  rank_id: number;
  kpi_id: number;
  requirement_id: number;
  target_count_house: number;
  target_count_condo: number;
  minimum_skillset_score: number;
  timeframe_days: number;
}

export interface UpdateRankPromotionRequest {
  rank_id?: number;
  kpi_id?: number;
  requirement_id?: number;
  target_count_house?: number;
  target_count_condo?: number;
  minimum_skillset_score?: number;
  timeframe_days?: number;
}

class RankPromotionService {
  /**
   * Get all Rank Promotion Condition records
   */
  async getAllRankPromotions(): Promise<RankPromotion[]> {
    try {
      console.log('Fetching all Rank Promotion Conditions');
      
      const response = await retryRequest(async () => {
        return await xanoApi.get('/ranking_promotion_condition');
      });
      
      console.log('Rank Promotion Conditions fetched successfully:', response.data);
      
      // Map the response to include the name property required by BaseItem
      return response.data.map((promotion: any) => ({
        ...promotion,
        name: `${promotion.rank_name || 'Unknown Rank'} - ${promotion.kpi_name || 'Unknown KPI'} - ${promotion.requirement_name || 'Unknown Requirement'}` // Create a name for BaseItem compatibility
      }));
    } catch (error) {
      console.error('Error fetching Rank Promotion Conditions:', error);
      throw error;
    }
  }

  /**
   * Get a Rank Promotion Condition by ID
   */
  async getRankPromotionById(promotionId: number): Promise<RankPromotion> {
    try {
      console.log(`Fetching Rank Promotion Condition with ID ${promotionId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.get(`/ranking_promotion_condition/${promotionId}`);
      });
      
      console.log('Rank Promotion Condition fetched successfully:', response.data);
      
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: `${response.data.rank_name || 'Unknown Rank'} - ${response.data.kpi_name || 'Unknown KPI'} - ${response.data.requirement_name || 'Unknown Requirement'}`
      };
    } catch (error) {
      console.error(`Error fetching Rank Promotion Condition with ID ${promotionId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new Rank Promotion Condition
   */
  async createRankPromotion(promotionData: CreateRankPromotionRequest): Promise<RankPromotion> {
    try {
      console.log('Creating new Rank Promotion Condition with data:', promotionData);
      
      const response = await retryRequest(async () => {
        return await xanoApi.post('/ranking_promotion_condition', promotionData);
      });
      
      console.log('Rank Promotion Condition created successfully:', response.data);
      
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: `Rank Promotion Condition #${response.data.id}`
      };
    } catch (error) {
      console.error('Error creating Rank Promotion Condition:', error);
      throw error;
    }
  }

  /**
   * Update an existing Rank Promotion Condition
   */
  async updateRankPromotion(promotionId: number, promotionData: UpdateRankPromotionRequest): Promise<RankPromotion> {
    try {
      console.log(`Updating Rank Promotion Condition with ID ${promotionId} with data:`, promotionData);
      console.log(`API endpoint: /ranking_promotion_condition/${promotionId}`);
      
      const response = await retryRequest(async () => {
        return await xanoApi.patch(`/ranking_promotion_condition/${promotionId}`, promotionData);
      });
      
      console.log('Update Rank Promotion Condition response:', response.data);
      
      // Add the name property required by BaseItem
      return {
        ...response.data,
        name: `Rank Promotion Condition #${response.data.id}`
      };
    } catch (error) {
      console.error(`Error updating Rank Promotion Condition with ID ${promotionId}:`, error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  /**
   * Delete a Rank Promotion Condition
   */
  async deleteRankPromotion(promotionId: number): Promise<void> {
    try {
      await retryRequest(async () => {
        return await xanoApi.delete(`/ranking_promotion_condition/${promotionId}`);
      });
    } catch (error) {
      console.error(`Error deleting Rank Promotion Condition with ID ${promotionId}:`, error);
      throw error;
    }
  }
}

export const rankPromotionService = new RankPromotionService(); 