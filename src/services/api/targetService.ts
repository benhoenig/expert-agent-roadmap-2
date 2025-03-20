import { tryCatchWrapper, makeApiRequest } from './xanoClient';

// Target Management Types
export interface TargetSummary {
  week_id: number;
  week_name: string;
  sales_id: number;
  sales_name: string;
  kpi_count: number;
  requirement_count: number;
}

export interface TargetDetails {
  action_kpis: {
    id: number;
    name: string;
    target_value: number;
  }[];
  skillset_kpis: {
    id: number;
    name: string;
    target_value: number;
  }[];
  requirements: {
    id: number;
    name: string;
    target_value: number;
  }[];
}

export interface TargetData {
  week_id: number;
  sales_id: number;
  action_kpis: {
    id: number;
    name: string;
    target_value: number;
  }[];
  skillset_kpis: {
    id: number;
    name: string;
    target_value: number;
  }[];
  requirements: {
    id: number;
    name: string;
    target_value: number;
  }[];
}

/**
 * Service for target management operations
 */
export const targetService = {
  /**
   * Get target summaries
   * @returns Array of target summaries
   */
  getTargetSummaries: async (): Promise<TargetSummary[]> => {
    return tryCatchWrapper(async () => {
      const response = await makeApiRequest('get', '/targets/summary', null);
      return response;
    }, 'Error fetching target summaries');
  },
  
  /**
   * Get target details for a specific week and sales user
   * @param weekId - Week ID
   * @param salesId - Sales ID 
   * @returns Target details
   */
  getTargetDetails: async (weekId: number, salesId: number): Promise<TargetDetails> => {
    return tryCatchWrapper(async () => {
      const response = await makeApiRequest('get', `/targets/details/${weekId}/${salesId}`, null);
      return response;
    }, `Error fetching target details for week ${weekId} and sales ${salesId}`);
  },
  
  /**
   * Create targets for a specific week and sales user
   * @param targetData - Target data to create
   * @returns Created target data
   */
  createTargets: async (targetData: TargetData): Promise<any> => {
    return tryCatchWrapper(async () => {
      const response = await makeApiRequest('post', '/targets', targetData);
      return response;
    }, 'Error creating targets');
  },
  
  /**
   * Update targets for a specific week and sales user
   * @param targetData - Target data to update
   * @returns Updated target data
   */
  updateTargets: async (targetData: TargetData): Promise<any> => {
    return tryCatchWrapper(async () => {
      const response = await makeApiRequest(
        'put', 
        `/targets/${targetData.week_id}/${targetData.sales_id}`, 
        targetData
      );
      return response;
    }, `Error updating targets for week ${targetData.week_id} and sales ${targetData.sales_id}`);
  },
  
  /**
   * Delete targets for a specific week and sales user
   * @param weekId - Week ID
   * @param salesId - Sales ID
   * @returns Operation result
   */
  deleteTargets: async (weekId: number, salesId: number): Promise<any> => {
    return tryCatchWrapper(async () => {
      const response = await makeApiRequest('delete', `/targets/${weekId}/${salesId}`, null);
      return response;
    }, `Error deleting targets for week ${weekId} and sales ${salesId}`);
  }
}; 