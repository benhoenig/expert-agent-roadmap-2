import { tryCatchWrapper, makeApiRequest, apiCache } from './xanoClient';

// Sales user interface
export interface SalesUser {
  id: number;
  user_id: number;
  mentor_id?: number | null;
  starting_date: string;
  generation: number;
  property_type: string;
  probation_status: string;
  probation_extended: boolean;
  probation_remark?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    full_name: string;
    nickname?: string;
    role: string;
    user_status: string;
  };
  display_name?: string;
}

export interface UpdateSalesMentorData {
  mentor_id: number | null;
}

/**
 * Service for sales user management and mentor assignments
 */
export const salesService = {
  /**
   * Get all sales users with optional filtering
   * @param options - Filter options
   * @returns Array of sales users
   */
  getSalesUsers: async (options: { mentorId?: number, includeUnassigned?: boolean } = {}): Promise<SalesUser[]> => {
    return tryCatchWrapper(async () => {
      // Build query parameters
      const queryParams: Record<string, any> = { _with: 'user' };
      
      // Add mentor_id filter if provided
      if (options.mentorId !== undefined) {
        queryParams.mentor_id = options.mentorId;
      }
      
      // Fetch sales records with user details
      const salesRecords = await makeApiRequest('get', '/sales', queryParams);
      
      // Ensure we have an array to work with
      if (!Array.isArray(salesRecords)) {
        return [];
      }
      
      // Process records to include display_name for convenience
      return salesRecords.map(salesRecord => ({
        ...salesRecord,
        display_name: salesRecord.user ? 
          (salesRecord.user.full_name || salesRecord.user.username || `Sales ${salesRecord.id}`) : 
          `Sales ${salesRecord.id}`
      }));
    }, 'Error fetching sales users');
  },
  
  /**
   * Get sales users assigned to a specific mentor
   * @param mentorId - Mentor ID
   * @returns Array of sales users assigned to the mentor
   */
  getSalesByMentor: async (mentorId: number): Promise<SalesUser[]> => {
    return tryCatchWrapper(async () => {
      const queryParams = { 
        _with: 'user',
        mentor_id: mentorId
      };
      
      const salesRecords = await makeApiRequest('get', '/sales', queryParams);
      
      if (!Array.isArray(salesRecords)) {
        return [];
      }
      
      return salesRecords.map(salesRecord => ({
        ...salesRecord,
        display_name: salesRecord.user ? 
          (salesRecord.user.full_name || salesRecord.user.username || `Sales ${salesRecord.id}`) : 
          `Sales ${salesRecord.id}`
      }));
    }, `Error fetching sales for mentor ID ${mentorId}`);
  },
  
  /**
   * Get unassigned sales users
   * @returns Array of unassigned sales users
   */
  getUnassignedSales: async (): Promise<SalesUser[]> => {
    return tryCatchWrapper(async () => {
      // Using null filter doesn't work well with all APIs, so fetch all and filter
      const salesRecords = await makeApiRequest('get', '/sales', { _with: 'user' });
      
      if (!Array.isArray(salesRecords)) {
        return [];
      }
      
      // Filter for unassigned sales
      const unassignedSales = salesRecords.filter(sale => 
        sale.mentor_id === null || 
        sale.mentor_id === undefined
      ).map(salesRecord => ({
        ...salesRecord,
        display_name: salesRecord.user ? 
          (salesRecord.user.full_name || salesRecord.user.username || `Sales ${salesRecord.id}`) : 
          `Sales ${salesRecord.id}`
      }));
      
      return unassignedSales;
    }, 'Error fetching unassigned sales');
  },
  
  /**
   * Update mentor assignment for a sales user
   * @param salesId - Sales ID
   * @param mentorId - Mentor ID (or null to unassign)
   * @returns Updated sales user data
   */
  updateMentorAssignment: async (salesId: number, mentorId: number | null): Promise<SalesUser> => {
    return tryCatchWrapper(async () => {
      // Request the current sales record first to ensure we have all required fields
      const currentRecord = await makeApiRequest('get', `/sales/${salesId}`, null, { useCache: false });
      
      if (!currentRecord) {
        throw new Error(`Sales record not found for sales ID ${salesId}`);
      }
      
      // Update only the mentor_id field
      const payload = {
        ...currentRecord,
        mentor_id: mentorId
      };
      
      // Send the update request
      const result = await makeApiRequest('patch', `/sales/${salesId}`, payload, { useCache: false });
      
      // Invalidate sales cache to ensure fresh data on next fetch
      apiCache.invalidate('/sales');
      
      return result;
    }, `Error updating mentor assignment for sales ${salesId}`);
  },
  
  /**
   * Get all mentors for selection dropdown
   * @returns Array of mentor users
   */
  getMentors: async (): Promise<any[]> => {
    return tryCatchWrapper(async () => {
      const users = await makeApiRequest('get', '/user', { role: 'Mentor' });
      
      if (!Array.isArray(users)) {
        return [];
      }
      
      return users.map(user => ({
        id: user.id,
        name: user.full_name || user.username || `Mentor ${user.id}`,
        ...user
      }));
    }, 'Error fetching mentors');
  }
}; 