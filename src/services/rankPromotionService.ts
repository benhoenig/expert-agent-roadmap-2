import { makeApiRequest, tryCatchWrapper } from "./api/xanoClient";
import { BaseItem } from "../components/dashboard/tables/BaseTable";

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
   * Get all Rank Promotion records
   */
  async getAllRankPromotions(): Promise<RankPromotion[]> {
    return tryCatchWrapper(async () => {
      console.log('Fetching all Rank Promotion conditions');
      
      const data = await makeApiRequest('get', '/ranking_promotion_condition');
      
      console.log('Rank Promotion conditions fetched successfully:', data);
      // Map the response to include required fields
      return data.map((promotion: any) => ({
        ...promotion,
        name: `${promotion.rank_name} - ${promotion.kpi_name} - ${promotion.requirement_name}` // Create a display name
      }));
    }, 'getAllRankPromotions');
  }

  /**
   * Get a Rank Promotion by ID
   */
  async getRankPromotionById(promotionId: number): Promise<RankPromotion> {
    return tryCatchWrapper(async () => {
      console.log(`Fetching Rank Promotion with ID ${promotionId}`);
      
      const data = await makeApiRequest('get', `/ranking_promotion_condition/${promotionId}`);
      
      console.log('Rank Promotion fetched successfully:', data);
      // Add the name property required by BaseItem
      return {
        ...data,
        name: `${data.rank_name} - ${data.kpi_name} - ${data.requirement_name}` // Create a display name
      };
    }, `getRankPromotionById(${promotionId})`);
  }

  /**
   * Create a new Rank Promotion
   */
  async createRankPromotion(promotionData: CreateRankPromotionRequest): Promise<RankPromotion> {
    return tryCatchWrapper(async () => {
      console.log('Creating new Rank Promotion with data:', promotionData);
      
      const data = await makeApiRequest('post', '/ranking_promotion_condition', promotionData);
      
      console.log('Rank Promotion created successfully:', data);
      // Add the name property
      return {
        ...data,
        name: `Rank Promotion ${data.id}` // Basic name since we may not have the relation data yet
      };
    }, 'createRankPromotion');
  }

  /**
   * Update an existing Rank Promotion
   */
  async updateRankPromotion(promotionId: number, promotionData: UpdateRankPromotionRequest): Promise<RankPromotion> {
    return tryCatchWrapper(async () => {
      console.log(`Updating Rank Promotion with ID ${promotionId} with data:`, promotionData);
      
      const data = await makeApiRequest('patch', `/ranking_promotion_condition/${promotionId}`, promotionData);
      
      console.log('Update Rank Promotion response:', data);
      
      // Add the name property
      return {
        ...data,
        name: `${data.rank_name || ''} - ${data.kpi_name || ''} - ${data.requirement_name || ''}`.trim()
      };
    }, `updateRankPromotion(${promotionId})`);
  }

  /**
   * Delete a Rank Promotion
   */
  async deleteRankPromotion(promotionId: number): Promise<void> {
    return tryCatchWrapper(async () => {
      await makeApiRequest('delete', `/ranking_promotion_condition/${promotionId}`);
    }, `deleteRankPromotion(${promotionId})`);
  }
}

export const rankPromotionService = new RankPromotionService(); 