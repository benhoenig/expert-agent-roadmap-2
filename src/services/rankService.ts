import { makeApiRequest, tryCatchWrapper } from "./api/xanoClient";
import { BaseItem } from "../components/dashboard/tables/BaseTable";

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
    return tryCatchWrapper(async () => {
      console.log('Fetching all Ranks');
      
      const data = await makeApiRequest('get', '/rank');
      
      console.log('Ranks fetched successfully:', data);
      // Map the response to include the name property required by BaseItem
      return data.map((rank: any) => ({
        ...rank,
        name: rank.rank_name // Map rank_name to name for BaseItem compatibility
      }));
    }, 'getAllRanks');
  }

  /**
   * Get a Rank by ID
   */
  async getRankById(rankId: number): Promise<Rank> {
    return tryCatchWrapper(async () => {
      console.log(`Fetching Rank with ID ${rankId}`);
      
      const data = await makeApiRequest('get', `/rank/${rankId}`);
      
      console.log('Rank fetched successfully:', data);
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.rank_name // Map rank_name to name for BaseItem compatibility
      };
    }, `getRankById(${rankId})`);
  }

  /**
   * Create a new Rank
   */
  async createRank(rankData: CreateRankRequest): Promise<Rank> {
    return tryCatchWrapper(async () => {
      console.log('Creating new Rank with data:', rankData);
      
      const data = await makeApiRequest('post', '/rank', rankData);
      
      console.log('Rank created successfully:', data);
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.rank_name // Map rank_name to name for BaseItem compatibility
      };
    }, 'createRank');
  }

  /**
   * Update an existing Rank
   */
  async updateRank(rankId: number, rankData: UpdateRankRequest): Promise<Rank> {
    return tryCatchWrapper(async () => {
      console.log(`Updating Rank with ID ${rankId} with data:`, rankData);
      console.log(`API endpoint: /rank/${rankId}`);
      
      const data = await makeApiRequest('patch', `/rank/${rankId}`, rankData);
      
      console.log('Update Rank response:', data);
      
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.rank_name // Map rank_name to name for BaseItem compatibility
      };
    }, `updateRank(${rankId})`);
  }

  /**
   * Delete a Rank
   */
  async deleteRank(rankId: number): Promise<void> {
    return tryCatchWrapper(async () => {
      await makeApiRequest('delete', `/rank/${rankId}`);
    }, `deleteRank(${rankId})`);
  }
}

export const rankService = new RankService(); 