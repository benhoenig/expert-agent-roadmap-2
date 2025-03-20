import { tryCatchWrapper, makeApiRequest, apiCache } from './xanoClient';
import { rankService } from '../../services/rankService';
import { createCrudService } from './crudServiceFactory';
import { weeklyDataService } from './weeklyDataService';

// Xano API base URL
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

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
  current_rank?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    full_name: string;
    nickname?: string;
    profile_image?: string;
    role: string;
    user_status: string;
  };
  display_name?: string;
  weeks_generated?: number;
  weeks_with_errors?: number;
}

// User interface for type safety
export interface User {
  id: number;
  username: string;
  full_name: string;
  nickname?: string;
  profile_image?: string;
  role: string;
  user_status: string;
}

// Dashboard Sales interface with additional fields needed for the mentor dashboard
export interface DashboardSalesUser extends SalesUser {
  profileImage?: string;
  name: string;
  currentRank: string;
  weeksPassed?: number;
  target100PercentWeeks?: number;
  targetFailedWeeks?: number;
  cohWarnings?: number;
  orderNumber: number;
}

export interface UpdateSalesMentorData {
  mentor_id: number | null;
}

// Create base CRUD operations for sales
const salesCrud = createCrudService<SalesUser>('/sales', 'Sales');

/**
 * Service for sales user management and mentor assignments
 */
export const salesService = {
  // Basic CRUD operations
  getSalesById: async (id: number, options?: { forceRefresh?: boolean }): Promise<SalesUser> => 
    salesCrud.getById(id, options),
    
  createSales: async (data: Partial<SalesUser>): Promise<SalesUser> => 
    salesCrud.create(data),
    
  updateSales: async (id: number, data: Partial<SalesUser>): Promise<SalesUser> => 
    salesCrud.update(id, data),
    
  deleteSales: async (id: number): Promise<void> => 
    salesCrud.delete(id),

  /**
   * Get all sales users with optional filtering
   * @param options - Filter options
   * @returns Array of sales users
   */
  getSalesUsers: async (options: { mentorId?: number, includeUnassigned?: boolean } = {}): Promise<SalesUser[]> => {
    return tryCatchWrapper(async () => {
      // Try different format for join parameter - simple with parameter
      const queryParams: Record<string, any> = { with: 'user' };
      
      // Add mentor_id filter if provided
      if (options.mentorId !== undefined) {
        queryParams.mentor_id = options.mentorId;
      }
      
      console.log('[SalesService] Fetching sales users with params:', queryParams);
      
      // Log the exact URL that would be constructed (for debugging)
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      console.log(`[SalesService] DEBUG: Full URL would be: ${XANO_BASE_URL}/sales?${params.toString()}`);
      
      // Fetch sales records with user details
      console.log(`[DEBUG] Making API request to /sales with params:`, JSON.stringify(queryParams, null, 2));
      const salesRecords = await makeApiRequest('get', '/sales', queryParams);
      console.log(`[DEBUG] API response received with ${Array.isArray(salesRecords) ? salesRecords.length : 'non-array'} records`);
      
      // Ensure we have an array to work with
      if (!Array.isArray(salesRecords)) {
        console.warn('[SalesService] No sales records found or invalid response format');
        return [];
      }
      
      console.log(`[SalesService] Retrieved ${salesRecords.length} sales records`);
      
      // Debug: Check join status
      let needManualUserFetch = false;
      if (salesRecords.length > 0) {
        console.log('[SalesService] DEBUG: First record user object:', 
          salesRecords[0].user ? 'PRESENT' : 'MISSING');
          
        // Show more details about the first record
        console.log(`[DEBUG] First record structure: id=${salesRecords[0].id}, user_id=${salesRecords[0].user_id}, mentor_id=${salesRecords[0].mentor_id || 'null'}`);
          
        // If the user object is missing, try to manually retrieve user details
        if (!salesRecords[0].user) {
          console.log('[SalesService] DEBUG: Join failed, will try to retrieve user data separately');
          needManualUserFetch = true;
        } else {
          console.log(`[DEBUG] User object contains: ${Object.keys(salesRecords[0].user).join(', ')}`);
        }
      }
      
      // If join failed, manually fetch and join the user data
      let enhancedSalesRecords = [...salesRecords];
      if (needManualUserFetch && salesRecords.length > 0) {
        console.log('[SalesService] Performing manual user data join for sales records');
        
        try {
          // Get all unique user IDs
          const userIds = [...new Set(salesRecords.map(record => record.user_id))];
          console.log(`[SalesService] Found ${userIds.length} unique user IDs to fetch`);
          
          // Fetch all users at once to avoid multiple API calls
          const usersResponse = await makeApiRequest('get', '/user');
          
          if (Array.isArray(usersResponse)) {
            // Create a map of user ID to user data for quick lookups
            const userMap = new Map(usersResponse.map(user => [user.id, user]));
            console.log(`[SalesService] Fetched ${usersResponse.length} users, created lookup map`);
            
            // Join the user data with the sales records
            enhancedSalesRecords = salesRecords.map(salesRecord => {
              const userData = userMap.get(salesRecord.user_id);
              
              if (userData) {
                console.log(`[SalesService] Manually joined user data for sales ID ${salesRecord.id}`);
                return {
                  ...salesRecord,
                  user: {
                    id: userData.id,
                    username: userData.username,
                    full_name: userData.full_name,
                    nickname: userData.nickname,
                    profile_image: userData.profile_image,
                    role: userData.role,
                    user_status: userData.user_status
                  }
                };
              }
              
              console.log(`[SalesService] Warning: Could not find user with ID ${salesRecord.user_id} for sales ID ${salesRecord.id}`);
              return salesRecord;
            });
          } else {
            console.warn('[SalesService] Failed to fetch user data for manual join');
          }
        } catch (error) {
          console.error('[SalesService] Error during manual user join:', error);
        }
      }
      
      // Process records to include display_name for convenience
      return enhancedSalesRecords.map(salesRecord => {
        const displayName = salesRecord.user ? 
          (salesRecord.user.nickname || salesRecord.user.full_name || salesRecord.user.username || `Sales ${salesRecord.id}`) : 
          `Sales ${salesRecord.id}`;
        
        // Log what's happening with each record
        console.log(`[SalesService] Setting display_name for sales ID ${salesRecord.id}:`, 
          salesRecord.user ? 
            `Using ${salesRecord.user.nickname ? 'nickname' : salesRecord.user.full_name ? 'full_name' : 'username'}: "${displayName}"` : 
            'No user data, using fallback');
        
        return {
          ...salesRecord,
          display_name: displayName
        };
      });
    }, 'Error fetching sales users');
  },
  
  /**
   * Get sales users assigned to a specific mentor
   * @param mentorId - Mentor ID
   * @returns Array of sales users assigned to the mentor
   */
  getSalesByMentor: async (mentorId: number): Promise<SalesUser[]> => {
    console.log(`[DEBUG] getSalesByMentor called for mentor ID ${mentorId}`);
    const salesRecords = await salesService.getSalesUsers({ mentorId });
    
    // Enhanced debugging
    console.log(`[DEBUG] Retrieved ${salesRecords.length} sales records for mentor ID ${mentorId}`);
    if (salesRecords.length > 0) {
      const firstRecord = salesRecords[0];
      console.log(`[DEBUG] First record ID: ${firstRecord.id}, user_id: ${firstRecord.user_id}`);
      console.log(`[DEBUG] Join success: ${firstRecord.user ? 'YES' : 'NO'}`);
      if (firstRecord.user) {
        console.log(`[DEBUG] Joined user data: id=${firstRecord.user.id}, name=${firstRecord.user.full_name || firstRecord.user.nickname || firstRecord.user.username}`);
      } else {
        console.log(`[DEBUG] User join failed - checking if user_id might be incorrect`);
      }
    }
    
    return salesRecords;
  },
  
  /**
   * Get unassigned sales users
   * @returns Array of unassigned sales users
   */
  getUnassignedSales: async (): Promise<SalesUser[]> => {
    return tryCatchWrapper(async () => {
      console.log('[SalesService] Fetching unassigned sales users');
      
      // Try the simple with parameter
      const queryParams = { with: 'user' };
      
      // Log the exact URL that would be constructed (for debugging)
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      console.log(`[SalesService] DEBUG: Full URL for unassigned would be: ${XANO_BASE_URL}/sales?${params.toString()}`);
      
      // Using null filter doesn't work well with all APIs, so fetch all and filter
      const salesRecords = await makeApiRequest('get', '/sales', queryParams);
      
      if (!Array.isArray(salesRecords)) {
        console.warn('[SalesService] No sales records found or invalid response format');
        return [];
      }
      
      // Debug: Check join status for first record
      let needManualUserFetch = false;
      if (salesRecords.length > 0) {
        console.log('[SalesService] DEBUG: First unassigned record user object:', 
          salesRecords[0].user ? 'PRESENT' : 'MISSING');
          
        if (!salesRecords[0].user) {
          console.log('[SalesService] DEBUG: Join failed in unassigned sales, will retrieve user data separately');
          needManualUserFetch = true;
        }
      }
      
      // Filter for unassigned sales
      const unassignedSales = salesRecords.filter(sale => 
        sale.mentor_id === null || 
        sale.mentor_id === undefined
      );
      
      // If join failed, manually fetch and join the user data
      let enhancedUnassignedSales = [...unassignedSales];
      if (needManualUserFetch && unassignedSales.length > 0) {
        console.log('[SalesService] Performing manual user data join for unassigned sales records');
        
        try {
          // Get all unique user IDs
          const userIds = [...new Set(unassignedSales.map(record => record.user_id))];
          console.log(`[SalesService] Found ${userIds.length} unique user IDs to fetch for unassigned sales`);
          
          // Fetch all users at once to avoid multiple API calls
          const usersResponse = await makeApiRequest('get', '/user');
          
          if (Array.isArray(usersResponse)) {
            // Create a map of user ID to user data for quick lookups
            const userMap = new Map(usersResponse.map(user => [user.id, user]));
            console.log(`[SalesService] Fetched ${usersResponse.length} users, created lookup map for unassigned sales`);
            
            // Join the user data with the sales records
            enhancedUnassignedSales = unassignedSales.map(salesRecord => {
              const userData = userMap.get(salesRecord.user_id);
              
              if (userData) {
                console.log(`[SalesService] Manually joined user data for unassigned sales ID ${salesRecord.id}`);
                return {
                  ...salesRecord,
                  user: {
                    id: userData.id,
                    username: userData.username,
                    full_name: userData.full_name,
                    nickname: userData.nickname,
                    profile_image: userData.profile_image,
                    role: userData.role,
                    user_status: userData.user_status
                  }
                };
              }
              
              console.log(`[SalesService] Warning: Could not find user with ID ${salesRecord.user_id} for unassigned sales ID ${salesRecord.id}`);
              return salesRecord;
            });
          } else {
            console.warn('[SalesService] Failed to fetch user data for manual join of unassigned sales');
          }
        } catch (error) {
          console.error('[SalesService] Error during manual user join for unassigned sales:', error);
        }
      }
      
      // Add display_name to each record
      const unassignedSalesWithDisplayName = enhancedUnassignedSales.map(salesRecord => {
        const displayName = salesRecord.user ? 
          (salesRecord.user.nickname || salesRecord.user.full_name || salesRecord.user.username || `Sales ${salesRecord.id}`) : 
          `Sales ${salesRecord.id}`;
          
        // Log what we're using for display name
        console.log(`[SalesService] Setting display_name for unassigned sales ID ${salesRecord.id}:`, 
          salesRecord.user ? 
            `Using ${salesRecord.user.nickname ? 'nickname' : salesRecord.user.full_name ? 'full_name' : 'username'}: "${displayName}"` : 
            'No user data, using fallback');
          
        return {
          ...salesRecord,
          display_name: displayName
        };
      });
      
      console.log(`[SalesService] Found ${unassignedSalesWithDisplayName.length} unassigned sales records`);
      
      return unassignedSalesWithDisplayName;
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
      console.log(`[SalesService] Updating mentor assignment for sales ID ${salesId} to mentor ID ${mentorId || 'NULL'}`);
      
      // We can use our update method, but we need to be specific about only updating mentor_id
      const updateData = { mentor_id: mentorId };
      
      // Send the update request
      const result = await salesCrud.update(salesId, updateData);
      
      // Invalidate sales cache to ensure fresh data on next fetch
      apiCache.invalidate('/sales');
      
      console.log(`[SalesService] Successfully updated mentor assignment for sales ID ${salesId}`);
      
      return result;
    }, `Error updating mentor assignment for sales ${salesId}`);
  },
  
  /**
   * Get all mentors for selection dropdown
   * @returns Array of mentor users
   */
  getMentors: async (): Promise<any[]> => {
    return tryCatchWrapper(async () => {
      console.log('[SalesService] Fetching all mentors');
      
      const users = await makeApiRequest('get', '/user', { role: 'Mentor' });
      
      if (!Array.isArray(users)) {
        console.warn('[SalesService] No mentors found or invalid response format');
        return [];
      }
      
      console.log(`[SalesService] Found ${users.length} mentors`);
      
      return users.map(user => ({
        id: user.id,
        name: user.full_name || user.username || `Mentor ${user.id}`,
        ...user
      }));
    }, 'Error fetching mentors');
  },
  
  /**
   * Get formatted sales data for the mentor dashboard
   * Includes additional information needed for the dashboard display
   * @param currentMentorId - The mentor ID (from the id field in the mentor table)
   * @param options - Optional parameters for the request
   * @returns Array of dashboard sales users with formatted data
   */
  getDashboardSalesByMentor: async (
    currentMentorId: number, 
    options?: { forceRefresh?: boolean }
  ): Promise<DashboardSalesUser[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[SalesService] Fetching dashboard sales data for mentor ID ${currentMentorId}${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      // Create a cache key for this specific mentor's dashboard data
      const cacheKey = `dashboard_sales_${currentMentorId}`;
      
      // Use cached data if available and not explicitly refreshing
      if (!options?.forceRefresh) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log(`[SalesService] Using cached dashboard data for mentor ID ${currentMentorId}`);
          return cachedData;
        }
      }
      
      // Step 1: Get sales records for this mentor using our helper method
      const salesRecords = await salesService.getSalesByMentor(currentMentorId);
      
      // Check if we got a valid response
      if (!Array.isArray(salesRecords) || salesRecords.length === 0) {
        console.warn(`[SalesService] No sales records found for mentor ID ${currentMentorId}`);
        return []; // Return empty array if no records found
      }
      
      console.log(`[SalesService] Received ${salesRecords.length} sales records`);
      
      // Add a double-check to ensure only sales with matching mentor_id are included
      // This is in case the API doesn't filter correctly
      const filteredSalesRecords = salesRecords.filter(record => record.mentor_id === currentMentorId);
      
      if (filteredSalesRecords.length !== salesRecords.length) {
        console.warn(`[SalesService] API returned ${salesRecords.length} records, but only ${filteredSalesRecords.length} match mentor_id ${currentMentorId}`);
      }
      
      // Step 3: Get rank information to map rank IDs to names
      let rankMap: Record<number, string> = {};
      try {
        // Try to use cached ranks if available
        const cachedRanks = apiCache.get('all_ranks');
        if (cachedRanks) {
          console.log('[SalesService] Using cached ranks for mapping');
          rankMap = cachedRanks.reduce((acc: Record<number, string>, rank: any) => {
            acc[rank.id] = rank.rank_name;
            return acc;
          }, {});
        } else {
          console.log('[SalesService] Fetching ranks for mapping');
          const ranks = await rankService.getAllRanks();
          rankMap = ranks.reduce((acc, rank) => {
            acc[rank.id] = rank.rank_name;
            return acc;
          }, {} as Record<number, string>);
          
          // Cache the ranks for future use
          apiCache.set('all_ranks', ranks);
        }
      } catch (error) {
        console.error('[SalesService] Error fetching ranks:', error);
        // Continue with empty rankMap, we'll use fallback values
      }
      
      // Step 4: Transform the data for dashboard display
      const dashboardSales = filteredSalesRecords.map((salesRecord, index) => {
        // Type assertion to ensure TypeScript knows user is properly typed
        const user = salesRecord.user || {} as SalesUser['user'];
        
        // Debug: Log if user data is missing
        if (!salesRecord.user) {
          console.log(`[SalesService] DEBUG: Record #${index} (ID ${salesRecord.id}) is missing user data`);
        } else {
          console.log(`[SalesService] DEBUG: Record #${index} (ID ${salesRecord.id}) has user data with nickname: "${user.nickname || '(empty)'}"`);
        }
        
        // Get rank name from the rankMap if available, otherwise use fallback
        const rankId = salesRecord.current_rank;
        const rankName = rankId && rankMap[rankId] 
          ? rankMap[rankId] 
          : (rankId ? `Rank ${rankId}` : 'Trainee');
        
        // Use nickname as first priority for name display 
        const displayName = (user.nickname || user.full_name || user.username || `Sales ${salesRecord.id}`);
        
        // Debug: Log what we're using for the name
        console.log(`[SalesService] Setting name for dashboard sales ID ${salesRecord.id}:`, 
          user.id ? 
            `Using ${user.nickname ? 'nickname' : user.full_name ? 'full_name' : 'username'}: "${displayName}"` : 
            'No user data, using fallback');
        
        // Return the enhanced sales record with all needed display data
        return {
          ...salesRecord,
          profileImage: user.profile_image || undefined,
          name: displayName,
          currentRank: rankName,
          weeksPassed: 0, // Placeholder, will be populated by weeklyDataService
          target100PercentWeeks: 0, // Placeholder
          targetFailedWeeks: 0, // Placeholder
          cohWarnings: 0, // Placeholder
          orderNumber: index + 1 // Add order for display in the list
        };
      });
      
      console.log(`[SalesService] Processed ${dashboardSales.length} sales records for mentor ID ${currentMentorId}`);
      
      // Cache the result
      apiCache.set(cacheKey, dashboardSales);
      
      return dashboardSales;
    }, `Error fetching dashboard sales for mentor ID ${currentMentorId}`);
  },

  /**
   * Create a new sales user with generated weeks for probation
   * @param data - Sales data
   * @returns Created sales user
   */
  createSalesWithWeeks: async (data: Partial<SalesUser>): Promise<SalesUser> => {
    return tryCatchWrapper(async () => {
      console.log('[SalesService] Creating new sales user with weeks:', data);
      
      // Ensure starting_date is provided
      if (!data.starting_date) {
        throw new Error('Starting date is required to create a sales user with weeks');
      }
      
      // Create the sales record
      const salesRecord = await salesCrud.create(data);
      
      // Generate weeks for the probation period
      try {
        const weekResult = await weeklyDataService.generateWeeksForSales(
          salesRecord.id,
          salesRecord.starting_date
        );
        
        // Log the result
        if (weekResult.success) {
          console.log(`[SalesService] Successfully generated ${weekResult.weeksGenerated} weeks for sales ID ${salesRecord.id}`);
          if (weekResult.errors > 0) {
            console.warn(`[SalesService] Failed to generate ${weekResult.errors} weeks due to Xano API errors`);
          }
        } else {
          console.error(`[SalesService] Failed to generate any weeks for sales ID ${salesRecord.id}`);
        }
        
        // Add a flag to indicate if weeks were fully generated
        salesRecord.weeks_generated = weekResult.weeksGenerated;
        salesRecord.weeks_with_errors = weekResult.errors;
      } catch (error) {
        console.error(`[SalesService] Error generating weeks for sales ID ${salesRecord.id}:`, error);
        // Continue even if week generation fails, to avoid losing the created sales record
      }
      
      return salesRecord;
    }, 'Error creating sales user with weeks');
  },

  /**
   * Check and generate missing weeks for an existing sales user
   * This can be used to fix users where week generation failed during creation
   * @param salesId - The ID of the sales user to check
   * @returns Result of the operation
   */
  checkAndGenerateWeeksForSales: async (salesId: number): Promise<{
    salesId: number;
    weeksExisted: number;
    weeksGenerated: number;
    errors: number;
  }> => {
    return tryCatchWrapper(async () => {
      console.log(`[SalesService] Checking and generating missing weeks for sales ID ${salesId}`);
      
      // First, get the sales record to get the starting date
      const salesRecord = await salesCrud.getById(salesId);
      
      if (!salesRecord.starting_date) {
        throw new Error(`Sales ID ${salesId} has no starting date`);
      }
      
      // Check existing weeks
      const weeks = await weeklyDataService.getWeeksBySalesIdRaw(salesId, { forceRefresh: true });
      console.log(`[SalesService] Found ${weeks.length} existing weeks for sales ID ${salesId}`);
      
      // If weeks already exist, return early
      if (weeks.length === 12) {
        return {
          salesId,
          weeksExisted: weeks.length,
          weeksGenerated: 0,
          errors: 0
        };
      }
      
      // Generate weeks
      const result = await weeklyDataService.generateWeeksForSales(
        salesId,
        salesRecord.starting_date
      );
      
      return {
        salesId,
        weeksExisted: weeks.length,
        weeksGenerated: result.weeksGenerated,
        errors: result.errors
      };
    }, `Error checking and generating weeks for sales ID ${salesId}`);
  }
}; 