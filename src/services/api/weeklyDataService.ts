import { tryCatchWrapper, makeApiRequest, apiCache } from './xanoClient';
import { sampleDataService } from '../sampleDataService';
import { kpiService, Kpi, KpiType } from './kpiService';
import { requirementService, Requirement } from './requirementService';
import { createCrudService } from './crudServiceFactory';

// Weekly data interfaces
export interface KpiAction {
  name: string;
  done: number;
  target: number;
  progress: number;
}

export interface KpiSkillset {
  name: string;
  wording: number;
  tonality: number;
  rapport: number;
  total: number;
}

export interface RequirementItem {
  name: string;
  isDone: boolean;
}

export interface RequirementCount {
  name: string;
  count: number;
}

export interface CodeOfHonorStatus {
  name: string;
  hasWarning: boolean;
}

export interface MentorNote {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
}

export interface WeekData {
  weekNumber: number;
  actions: KpiAction[];
  skillsets: KpiSkillset[];
  requirements: RequirementItem[];
  requirementCounts: RequirementCount[];
  codeOfHonors: CodeOfHonorStatus[];
  mentorNotes: MentorNote[];
}

export interface Week {
  id: number;
  week_number: number;
  month_number: number;
  start_date: string;
  end_date: string;
  created_at: string;
  is_current: boolean;
}

export interface SummaryMetrics {
  weeksPassed: number;
  target100PercentWeeks: number;
  targetFailedWeeks: number;
  cohWarnings: number;
}

// Define additional interfaces for KPI progress tracking
export interface ActionKpiProgress {
  id: number;
  created_at: string;
  sales_id: number;
  week_id: number;
  kpi_id: number;
  date_added: string;
  count: number;
  remark: string;
  attachment: string;
  updated_at: string;
  mentor_edited: number;
}

export interface MentorWeeklyTarget {
  id: number;
  created_at: string;
  mentor_id: number;
  sales_id: number;
  week_id: number;
  kpi_id: number;
  requirement_id: number;
  target_count: number;
}

// Create base CRUD operations for weeks
const weekCrud = createCrudService<Week>('/week', 'Week');

/**
 * Service for weekly data operations
 */
export const weeklyDataService = {
  // Basic CRUD operations for weeks
  getAllWeeks: async (options?: { forceRefresh?: boolean }): Promise<Week[]> => 
    weekCrud.getAll(options),
    
  getWeekById: async (id: number, options?: { forceRefresh?: boolean }): Promise<Week> => 
    weekCrud.getById(id, options),
    
  createWeek: async (data: Partial<Week>): Promise<Week> => 
    weekCrud.create(data),
    
  updateWeek: async (id: number, data: Partial<Week>): Promise<Week> => 
    weekCrud.update(id, data),
    
  deleteWeek: async (id: number): Promise<void> => 
    weekCrud.delete(id),
    
  /**
   * Get the current week
   * @param options - Optional parameters for the request
   * @returns Current week data
   */
  getCurrentWeek: async (options?: { forceRefresh?: boolean }): Promise<Week> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Fetching current week${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      const data = await makeApiRequest('get', '/week/current', null, {
        forceRefresh: options?.forceRefresh || false
      });
      
      return data;
    }, "Error fetching current week");
  },

  /**
   * Get all weeks data for a specific sales user
   * @param salesId - Sales user ID
   * @param options - Optional parameters for the request
   * @returns Array of week data
   */
  getWeeksBySalesId: async (
    salesId: number,
    options?: { forceRefresh?: boolean }
  ): Promise<WeekData[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Fetching weeks data for sales ID ${salesId}${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      // Check cache first for this specific sales user's week data
      const cacheKey = `week_data_sales_${salesId}`;
      
      if (!options?.forceRefresh) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log(`[WeeklyDataService] Using cached week data for sales ID ${salesId}`);
          return cachedData;
        }
      }
      
      // Using sample week data structure for now, but with real data from APIs where possible
      let sampleWeekData = sampleDataService.getSampleWeekData();
      
      try {
        // Create a more robust delay function to avoid rate limits
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Use a sequential approach to fetch data and avoid rate limits
        
        // Step 1: Try to use cached data first for all resources
        let allKpis: Kpi[] = [];
        let allRequirements: Requirement[] = [];
        
        // Check for cached KPIs first (global cache)
        const cachedKpis = apiCache.get('all_kpis');
        if (cachedKpis && !options?.forceRefresh) {
          console.log(`[WeeklyDataService] Using ${cachedKpis.length} cached KPIs`);
          allKpis = cachedKpis;
        }
        
        // Check for cached requirements first (global cache)
        const cachedRequirements = apiCache.get('all_requirements');
        if (cachedRequirements && !options?.forceRefresh) {
          console.log(`[WeeklyDataService] Using ${cachedRequirements.length} cached requirements`);
          allRequirements = cachedRequirements;
        }
        
        // Only fetch from API if cache is empty or forceRefresh is true
        if (allKpis.length === 0 || options?.forceRefresh) {
          try {
            // Wait longer before making the API call to avoid rate limits
            await delay(2000);
            allKpis = await kpiService.getAllKpis({
              forceRefresh: options?.forceRefresh || false
            });
            console.log(`[WeeklyDataService] Successfully fetched ${allKpis.length} KPIs`);
            
            // Cache KPIs for future use (longer TTL since they change infrequently)
            if (allKpis.length > 0) {
              apiCache.set('all_kpis', allKpis, 60 * 60 * 1000); // 60 minutes TTL
            }
          } catch (error: any) {
            console.warn('[WeeklyDataService] Could not fetch KPIs:', error.message);
            // Continue with empty KPIs array
          }
        }
        
        // Ensure significant delay between API calls to avoid rate limits
        await delay(4000);
        
        // Only fetch requirements if needed and if KPI call didn't fail with rate limiting
        if ((allRequirements.length === 0 || options?.forceRefresh) && 
            !String(allKpis).includes('rate limit')) {
          try {
            allRequirements = await requirementService.getAllRequirements({
              forceRefresh: options?.forceRefresh || false
            });
            console.log(`[WeeklyDataService] Successfully fetched ${allRequirements.length} requirements`);
            
            // Cache requirements for future use (longer TTL since they change infrequently)
            if (allRequirements.length > 0) {
              apiCache.set('all_requirements', allRequirements, 60 * 60 * 1000); // 60 minutes TTL
            }
          } catch (error: any) {
            console.warn('[WeeklyDataService] Could not fetch requirements:', error.message);
            // Continue with empty requirements array
          }
        }
        
        // Process KPI data if available
        if (allKpis && allKpis.length > 0) {
          // Sort KPIs by id ascending
          const sortedKpis = [...allKpis].sort((a, b) => a.id - b.id);
          
          // Filter by type
          const actionKpis = sortedKpis.filter(kpi => kpi.kpi_type === 'Action');
          const skillsetKpis = sortedKpis.filter(kpi => kpi.kpi_type === 'Skillset');
          
          console.log(`[WeeklyDataService] Using ${actionKpis.length} action KPIs and ${skillsetKpis.length} skillset KPIs from API`);
          
          // Update KPI data in the sample week data
          sampleWeekData = sampleWeekData.map(weekData => {
            // Create new actions array based on all action KPIs
            const updatedActions = actionKpis.map(kpi => {
              // Find existing action with same index or create a new one
              const existingAction = weekData.actions.find(a => a.name.includes(kpi.kpi_name)) || 
                                    weekData.actions[0] || 
                                    { done: 0, target: 10, progress: 0 };
              
              return {
                ...existingAction,
                name: kpi.kpi_name
              };
            });
            
            // Create new skillsets array based on all skillset KPIs
            const updatedSkillsets = skillsetKpis.map(kpi => {
              // Find existing skillset with same index or create a new one
              const existingSkillset = weekData.skillsets.find(s => s.name.includes(kpi.kpi_name)) || 
                                      weekData.skillsets[0] || 
                                      { wording: 0, tonality: 0, rapport: 0, total: 0 };
              
              return {
                ...existingSkillset,
                name: kpi.kpi_name
              };
            });
            
            // Copy existing requirements for now
            const updatedRequirements = [...weekData.requirements];
            const updatedRequirementCounts = [...weekData.requirementCounts];
            
            return {
              ...weekData,
              actions: updatedActions.length > 0 ? updatedActions : weekData.actions,
              skillsets: updatedSkillsets.length > 0 ? updatedSkillsets : weekData.skillsets,
              requirements: updatedRequirements,
              requirementCounts: updatedRequirementCounts
            };
          });
          
          console.log(`[WeeklyDataService] Updated week data with real KPI names from API`);
        } else {
          console.warn('[WeeklyDataService] No KPIs received from API, using placeholder KPI names');
        }
        
        // Process requirement data if available
        if (allRequirements && allRequirements.length > 0) {
          // Sort requirements by id ascending
          const sortedRequirements = [...allRequirements].sort((a, b) => a.id - b.id);
          
          console.log(`[WeeklyDataService] Using ${sortedRequirements.length} requirements from API`);
          
          // Update requirement data in the sample week data
          sampleWeekData = sampleWeekData.map(weekData => {
            // Create new requirements array based on all requirements from API
            const updatedRequirements = sortedRequirements.map(req => {
              // Find existing requirement with same name or create a new one with default values
              const existingRequirement = weekData.requirements.find(r => 
                r.name === req.requirement_name || r.name.includes(req.requirement_name)
              ) || { name: '', isDone: false };
              
              return {
                ...existingRequirement,
                name: req.requirement_name
              };
            });
            
            // Create new requirement counts array based on all requirements from API
            const updatedRequirementCounts = sortedRequirements.map(req => {
              // Find existing requirement count with same name or create a new one
              const existingRequirementCount = weekData.requirementCounts.find(r => 
                r.name === req.requirement_name || r.name.includes(req.requirement_name)
              ) || { name: '', count: 0 };
              
              return {
                ...existingRequirementCount,
                name: req.requirement_name
              };
            });
            
            return {
              ...weekData,
              requirements: updatedRequirements.length > 0 ? updatedRequirements : weekData.requirements,
              requirementCounts: updatedRequirementCounts.length > 0 ? updatedRequirementCounts : weekData.requirementCounts
            };
          });
          
          console.log(`[WeeklyDataService] Updated week data with real requirement names from API`);
        } else {
          console.warn('[WeeklyDataService] No requirements received from API, using placeholder requirement names');
        }
      } catch (error) {
        console.error('[WeeklyDataService] Error fetching data:', error);
        // Continue with sample data even if API calls fail
      }
      
      console.log(`[WeeklyDataService] Returning ${sampleWeekData.length} weeks of data for sales ID ${salesId}`);
      
      // Cache the processed data for this sales user
      apiCache.set(cacheKey, sampleWeekData, 5 * 60 * 1000); // 5 minutes TTL
      
      return sampleWeekData;
    }, `Error fetching weeks data for sales ID ${salesId}`);
  },
  
  /**
   * Get summary metrics for a sales user
   * @param salesId - Sales user ID
   * @param options - Optional parameters for the request
   * @returns Summary metrics
   */
  getSalesSummaryMetrics: async (
    salesId: number,
    options?: { forceRefresh?: boolean }
  ): Promise<SummaryMetrics> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Fetching summary metrics for sales ID ${salesId}${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      // Check cache first for metrics
      const cacheKey = `metrics_sales_${salesId}`;
      
      if (!options?.forceRefresh) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log(`[WeeklyDataService] Using cached metrics for sales ID ${salesId}`);
          return cachedData;
        }
      }
      
      // Using sample metrics for now
      const sampleMetrics = sampleDataService.getSampleSummaryMetrics();
      console.log(`[WeeklyDataService] Returning sample metrics for sales ID ${salesId}`);
      
      // Cache the metrics
      apiCache.set(cacheKey, sampleMetrics, 5 * 60 * 1000); // 5 minutes TTL
      
      return sampleMetrics;
    }, `Error fetching summary metrics for sales ID ${salesId}`);
  },
  
  /**
   * Generate week records for a sales user's probation period
   * @param salesId - The ID of the sales user
   * @param startingDate - The starting date of the sales user
   * @param probationWeeks - Number of weeks in probation (default: 12)
   */
  generateWeeksForSales: async (
    salesId: number, 
    startingDate: string, 
    probationWeeks: number = 12
  ): Promise<{success: boolean; weeksGenerated: number; errors: number}> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Generating ${probationWeeks} weeks for sales ID ${salesId} starting from ${startingDate}`);
      
      // Initialize result metrics
      const result = {
        success: false,
        weeksGenerated: 0,
        errors: 0
      };
      
      const startDate = new Date(startingDate);
      
      for (let weekNum = 1; weekNum <= probationWeeks; weekNum++) {
        // Calculate start and end dates for this week
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + (weekNum - 1) * 7);
        
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        
        // Determine month number (1-3 for probation period)
        const monthNumber = Math.ceil(weekNum / 4);
        
        // Format dates as YYYY-MM-DD
        const formattedStartDate = weekStartDate.toISOString().split('T')[0];
        const formattedEndDate = weekEndDate.toISOString().split('T')[0];
        
        // Try to create the week record with retry logic
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            // Create the week record using the /week POST endpoint
            await makeApiRequest('post', '/week', {
              sales_id: salesId,
              start_date: formattedStartDate,
              end_date: formattedEndDate,
              week_number: weekNum,
              month_number: monthNumber
            }, { useCache: false });
            
            // If successful, increment counter and break retry loop
            result.weeksGenerated++;
            break;
          } catch (error: any) {
            retryCount++;
            
            if (error?.response?.status === 500 && error?.response?.data?.message?.includes('Invalid name')) {
              // This is a known Xano backend issue, log it specifically
              console.warn(`[WeeklyDataService] Xano backend naming error for week ${weekNum} of sales ID ${salesId}: ${error?.response?.data?.message}`);
            } else {
              console.error(`[WeeklyDataService] Error creating week ${weekNum} for sales ID ${salesId}:`, error.message || 'Unknown error');
            }
            
            if (retryCount <= maxRetries) {
              // Wait longer between retries
              const delay = retryCount * 1000; // 1s, 2s
              console.log(`[WeeklyDataService] Retrying in ${delay}ms (attempt ${retryCount} of ${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              // Max retries reached, count as error and continue to next week
              result.errors++;
              console.error(`[WeeklyDataService] Failed to create week ${weekNum} after ${maxRetries} retries`);
            }
          }
        }
        
        // Small delay between week creations to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Set success flag if at least 1 week was created
      result.success = result.weeksGenerated > 0;
      
      // Log results
      if (result.success) {
        console.log(`[WeeklyDataService] Successfully generated ${result.weeksGenerated} weeks for sales ID ${salesId}`);
        if (result.errors > 0) {
          console.warn(`[WeeklyDataService] Failed to generate ${result.errors} weeks due to errors`);
        }
      } else {
        console.error(`[WeeklyDataService] Failed to generate any weeks for sales ID ${salesId}`);
      }
      
      // Invalidate any cached week data for this sales user
      apiCache.invalidate(`week_data_sales_${salesId}`);
      apiCache.invalidate(`raw_weeks_sales_${salesId}`);
      
      return result;
    }, `Error generating weeks for sales ID ${salesId}`);
  },
  
  /**
   * Get weeks for a specific sales user
   * @param salesId - Sales user ID
   * @param options - Optional parameters
   * @returns Array of week records
   */
  getWeeksBySalesIdRaw: async (
    salesId: number,
    options?: { forceRefresh?: boolean }
  ): Promise<Week[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Fetching raw week records for sales ID ${salesId}`);
      
      const cacheKey = `raw_weeks_sales_${salesId}`;
      
      if (!options?.forceRefresh) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log(`[WeeklyDataService] Using cached raw week data for sales ID ${salesId}`);
          return cachedData;
        }
      }
      
      // Query the week endpoint with a filter for the sales_id
      const weeks = await makeApiRequest('get', '/week', { sales_id: salesId }, { 
        forceRefresh: options?.forceRefresh || false 
      });
      
      // Cache the response
      if (Array.isArray(weeks)) {
        apiCache.set(cacheKey, weeks, 15 * 60 * 1000); // 15 minutes TTL
        console.log(`[WeeklyDataService] Cached ${weeks.length} raw week records for sales ID ${salesId}`);
      } else {
        console.warn(`[WeeklyDataService] Unexpected response format for weeks, expected array but got:`, typeof weeks);
      }
      
      return Array.isArray(weeks) ? weeks : [];
    }, `Error fetching raw week records for sales ID ${salesId}`);
  },
  
  /**
   * Find the week that a specific date belongs to
   * @param salesId - Sales user ID
   * @param date - Date to find the week for
   * @returns The week object containing the date, or null if not found
   */
  findWeekForDate: async (
    salesId: number,
    date: string
  ): Promise<Week | null> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Finding week for date ${date} and sales ID ${salesId}`);
      
      // Get all weeks for this sales user
      const weeks = await weeklyDataService.getWeeksBySalesIdRaw(salesId);
      
      if (weeks.length === 0) {
        console.log(`[WeeklyDataService] No weeks found for sales ID ${salesId}`);
        return null;
      }
      
      // Convert the target date to a Date object
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Find the week that contains this date
      const matchingWeek = weeks.find(week => {
        const weekStartDate = new Date(week.start_date);
        weekStartDate.setHours(0, 0, 0, 0);
        
        const weekEndDate = new Date(week.end_date);
        weekEndDate.setHours(23, 59, 59, 999); // End of the day
        
        return targetDate >= weekStartDate && targetDate <= weekEndDate;
      });
      
      if (matchingWeek) {
        console.log(`[WeeklyDataService] Found matching week ${matchingWeek.week_number} for date ${date}`);
      } else {
        console.log(`[WeeklyDataService] No matching week found for date ${date}`);
      }
      
      return matchingWeek || null;
    }, `Error finding week for date ${date} and sales ID ${salesId}`);
  },
  
  /**
   * Submit a KPI action and associate with the correct week
   * @param salesId - Sales user ID
   * @param kpiId - KPI ID
   * @param date - Date of the action
   * @param count - Number of actions performed
   * @param remark - Optional remark about the action
   * @returns Created KPI action
   */
  submitKpiAction: async (
    salesId: number,
    kpiId: number,
    date: string,
    count: number,
    remark?: string
  ): Promise<ActionKpiProgress> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Submitting KPI action for sales ID ${salesId}, KPI ID ${kpiId}, date ${date}`);
      
      // Find the appropriate week for this date
      const week = await weeklyDataService.findWeekForDate(salesId, date);
      
      if (!week) {
        throw new Error(`No matching week found for date ${date} and sales ID ${salesId}`);
      }
      
      console.log(`[WeeklyDataService] Found matching week ${week.week_number} (ID: ${week.id}) for date ${date}`);
      
      // Create the KPI action
      const actionData = {
        sales_id: salesId,
        week_id: week.id,
        kpi_id: kpiId,
        date_added: date,
        count,
        remark: remark || '',
        mentor_edited: 0
      };
      
      // Submit to the API
      const createdAction = await makeApiRequest(
        'post', 
        '/kpi_action_progress', 
        actionData, 
        { useCache: false }
      );
      
      // Invalidate any cached KPI actions for this sales user and week
      apiCache.invalidate(`kpi_actions_sales_${salesId}_week_${week.id}`);
      
      return createdAction;
    }, `Error submitting KPI action for sales ID ${salesId}, KPI ID ${kpiId}`);
  },
  
  /**
   * Get all KPI actions for a specific sales user and week
   * @param salesId - Sales user ID
   * @param weekId - Week ID
   * @returns Array of KPI actions
   */
  getKpiActionsBySalesAndWeek: async (
    salesId: number,
    weekId: number,
    options?: { forceRefresh?: boolean }
  ): Promise<ActionKpiProgress[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Fetching KPI actions for sales ID ${salesId}, week ID ${weekId}`);
      
      const cacheKey = `kpi_actions_sales_${salesId}_week_${weekId}`;
      
      if (!options?.forceRefresh) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log(`[WeeklyDataService] Using cached KPI actions for sales ID ${salesId}, week ID ${weekId}`);
          return cachedData;
        }
      }
      
      // Query the kpi_action_progress endpoint with filters
      const kpiActions = await makeApiRequest('get', '/kpi_action_progress', {
        sales_id: salesId,
        week_id: weekId
      }, { 
        forceRefresh: options?.forceRefresh || false 
      });
      
      // Cache the response
      if (Array.isArray(kpiActions)) {
        apiCache.set(cacheKey, kpiActions, 15 * 60 * 1000); // 15 minutes TTL
        console.log(`[WeeklyDataService] Cached ${kpiActions.length} KPI actions for sales ID ${salesId}, week ID ${weekId}`);
      } else {
        console.warn(`[WeeklyDataService] Unexpected response format for KPI actions, expected array but got:`, typeof kpiActions);
      }
      
      return Array.isArray(kpiActions) ? kpiActions : [];
    }, `Error fetching KPI actions for sales ID ${salesId}, week ID ${weekId}`);
  },
  
  /**
   * Get targets for a specific sales user and week
   * @param salesId - Sales user ID
   * @param weekId - Week ID
   * @returns Array of weekly targets
   */
  getWeeklyTargets: async (
    salesId: number,
    weekId: number,
    options?: { forceRefresh?: boolean }
  ): Promise<MentorWeeklyTarget[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Fetching weekly targets for sales ID ${salesId}, week ID ${weekId}`);
      
      const cacheKey = `weekly_targets_sales_${salesId}_week_${weekId}`;
      
      if (!options?.forceRefresh) {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log(`[WeeklyDataService] Using cached weekly targets for sales ID ${salesId}, week ID ${weekId}`);
          return cachedData;
        }
      }
      
      // Query the mentor_weekly_target endpoint with filters
      const targets = await makeApiRequest('get', '/mentor_weekly_target', {
        sales_id: salesId,
        week_id: weekId
      }, { 
        forceRefresh: options?.forceRefresh || false 
      });
      
      // If there are no targets, we'll generate default ones for testing
      if (!Array.isArray(targets) || targets.length === 0) {
        console.warn(`[WeeklyDataService] No weekly targets found for sales ID ${salesId}, week ID ${weekId}`);
        
        // Get all active KPIs to create default targets
        const kpis = await kpiService.getAllKpis();
        const actionKpis = kpis.filter(kpi => kpi.kpi_type === 'Action');
        
        // Generate default targets (for demonstration/testing)
        const defaultTargets = await weeklyDataService.createDefaultWeeklyTargets(salesId, weekId, actionKpis);
        return defaultTargets;
      }
      
      // Cache the response
      apiCache.set(cacheKey, targets, 15 * 60 * 1000); // 15 minutes TTL
      console.log(`[WeeklyDataService] Cached ${targets.length} weekly targets for sales ID ${salesId}, week ID ${weekId}`);
      
      return targets;
    }, `Error fetching weekly targets for sales ID ${salesId}, week ID ${weekId}`);
  },
  
  /**
   * Create default weekly targets for a sales user and week
   * This is used for testing/demonstration when no targets are found
   * @param salesId - Sales user ID
   * @param weekId - Week ID
   * @param kpis - Array of KPIs to create targets for
   * @returns Array of created weekly targets
   */
  createDefaultWeeklyTargets: async (
    salesId: number,
    weekId: number,
    kpis: Kpi[]
  ): Promise<MentorWeeklyTarget[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Creating default weekly targets for sales ID ${salesId}, week ID ${weekId}`);
      
      const createdTargets: MentorWeeklyTarget[] = [];
      
      // Get sales record to find mentor_id
      const salesRecords = await makeApiRequest('get', '/sales', { id: salesId });
      const salesRecord = Array.isArray(salesRecords) && salesRecords.length > 0 ? salesRecords[0] : null;
      const mentorId = salesRecord?.mentor_id || 1; // Default to mentor ID 1 if not found
      
      for (const kpi of kpis) {
        // Only create targets for Action type KPIs
        if (kpi.kpi_type !== 'Action') continue;
        
        // Create a default target of 10 for each KPI
        const targetData = {
          mentor_id: mentorId,
          sales_id: salesId,
          week_id: weekId,
          kpi_id: kpi.id,
          requirement_id: 0, // Default to 0, not used for KPI targets
          target_count: 10 // Default target count
        };
        
        try {
          // Create the target using the mentor_weekly_target POST endpoint
          const target = await makeApiRequest('post', '/mentor_weekly_target', targetData, { useCache: false });
          createdTargets.push(target);
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`[WeeklyDataService] Error creating default target for KPI ID ${kpi.id}:`, error);
          // Continue with other KPIs
        }
      }
      
      console.log(`[WeeklyDataService] Created ${createdTargets.length} default weekly targets`);
      
      // Invalidate any cached targets for this sales user and week
      apiCache.invalidate(`weekly_targets_sales_${salesId}_week_${weekId}`);
      
      return createdTargets;
    }, `Error creating default weekly targets for sales ID ${salesId}, week ID ${weekId}`);
  },
  
  /**
   * Calculate KPI progress for a specific week
   * @param salesId - Sales user ID
   * @param weekId - Week ID
   * @returns Progress calculation
   */
  calculateWeekProgress: async (
    salesId: number,
    weekId: number,
    options?: { forceRefresh?: boolean }
  ): Promise<{
    week_id: number;
    sales_id: number;
    kpi_details: {
      kpi_id: number;
      target: number;
      actual: number;
      percentage: number;
      achieved: boolean;
    }[];
    overall_progress: number;
    pass_criteria_met: boolean;
  }> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Calculating week progress for sales ID ${salesId}, week ID ${weekId}`);
      
      // Get all KPI actions for this sales user and week
      const kpiActions = await weeklyDataService.getKpiActionsBySalesAndWeek(
        salesId, 
        weekId, 
        { forceRefresh: options?.forceRefresh }
      );
      
      // Get all targets for this sales user and week
      const targets = await weeklyDataService.getWeeklyTargets(
        salesId, 
        weekId, 
        { forceRefresh: options?.forceRefresh }
      );
      
      // Get all KPIs for reference
      const allKpis = await kpiService.getAllKpis({ forceRefresh: options?.forceRefresh });
      
      // Group KPI actions by KPI ID and sum counts
      const kpiSums = kpiActions.reduce((sums: Record<number, number>, action) => {
        if (!sums[action.kpi_id]) {
          sums[action.kpi_id] = 0;
        }
        sums[action.kpi_id] += action.count;
        return sums;
      }, {});
      
      // Calculate progress percentage for each KPI
      const kpiProgress = targets.map(target => {
        const actualCount = kpiSums[target.kpi_id] || 0;
        const targetCount = target.target_count || 10; // Default to 10 if not set
        const progressPercent = Math.min(
          (actualCount / targetCount) * 100, 
          100
        );
        
        return {
          kpi_id: target.kpi_id,
          kpi_name: allKpis.find(k => k.id === target.kpi_id)?.kpi_name || `KPI ${target.kpi_id}`,
          target: targetCount,
          actual: actualCount,
          percentage: progressPercent,
          achieved: actualCount >= targetCount
        };
      });
      
      // Calculate overall progress for the week
      const overallProgress = kpiProgress.length > 0
        ? Math.round(kpiProgress.reduce((sum, kpi) => sum + kpi.percentage, 0) / kpiProgress.length)
        : 0;
      
      return {
        week_id: weekId,
        sales_id: salesId,
        kpi_details: kpiProgress,
        overall_progress: overallProgress,
        pass_criteria_met: overallProgress >= 100
      };
    }, `Error calculating week progress for sales ID ${salesId}, week ID ${weekId}`);
  },
  
  /**
   * Get complete probation period progress for a sales user
   * @param salesId - Sales user ID
   * @returns Probation progress summary
   */
  getProbationProgress: async (
    salesId: number,
    options?: { forceRefresh?: boolean }
  ): Promise<{
    sales_id: number;
    starting_date: string;
    current_week: number | null;
    probation_progress: number;
    weeks_total: number;
    weeks_completed: number;
    weeks_successful: number;
    on_track_to_pass: boolean;
    weekly_details: {
      week_id: number;
      week_number: number;
      month_number: number;
      overall_progress: number;
      pass_criteria_met: boolean;
    }[];
  }> => {
    return tryCatchWrapper(async () => {
      console.log(`[WeeklyDataService] Getting probation progress for sales ID ${salesId}`);
      
      // Get the sales record
      const salesRecords = await makeApiRequest('get', '/sales', { id: salesId }, {
        forceRefresh: options?.forceRefresh || false
      });
      
      if (!Array.isArray(salesRecords) || salesRecords.length === 0) {
        throw new Error(`Sales record with ID ${salesId} not found`);
      }
      
      const salesRecord = salesRecords[0];
      const startingDate = salesRecord.starting_date;
      
      // Get all weeks for this sales user
      const weeks = await weeklyDataService.getWeeksBySalesIdRaw(salesId, {
        forceRefresh: options?.forceRefresh || false
      });
      
      // Sort weeks by week_number
      const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number);
      
      // Calculate progress for each week
      const weeklyProgressPromises = sortedWeeks.map(week => 
        weeklyDataService.calculateWeekProgress(salesId, week.id, {
          forceRefresh: options?.forceRefresh || false
        })
      );
      
      // Wait for all progress calculations to complete
      const weeklyProgress = await Promise.all(weeklyProgressPromises);
      
      // Determine current week based on today's date
      const today = new Date();
      const currentWeek = sortedWeeks.find(week => {
        const weekStart = new Date(week.start_date);
        const weekEnd = new Date(week.end_date);
        return today >= weekStart && today <= weekEnd;
      });
      
      const currentWeekNumber = currentWeek ? currentWeek.week_number : null;
      
      // Calculate overall probation progress
      const completedWeeks = weeklyProgress.filter(w => w.overall_progress === 100).length;
      const totalWeeks = sortedWeeks.length;
      const probationProgress = totalWeeks > 0 
        ? Math.round((completedWeeks / totalWeeks) * 100)
        : 0;
      
      // Determine if on track to pass probation
      const weeksCompleted = sortedWeeks.filter(week => 
        new Date(week.end_date) < today
      ).length;
      
      const successfulWeeks = weeklyProgress.filter(w => w.pass_criteria_met).length;
      const onTrack = weeksCompleted > 0
        ? (successfulWeeks / weeksCompleted) >= 0.75 // 75% success rate
        : true;
      
      // Prepare weekly details
      const weeklyDetails = weeklyProgress.map(progress => {
        const weekRecord = sortedWeeks.find(w => w.id === progress.week_id);
        return {
          week_id: progress.week_id,
          week_number: weekRecord?.week_number || 0,
          month_number: weekRecord?.month_number || 0,
          overall_progress: progress.overall_progress,
          pass_criteria_met: progress.pass_criteria_met
        };
      });
      
      return {
        sales_id: salesId,
        starting_date: startingDate,
        current_week: currentWeekNumber,
        probation_progress: probationProgress,
        weeks_total: totalWeeks,
        weeks_completed: weeksCompleted,
        weeks_successful: successfulWeeks,
        on_track_to_pass: onTrack,
        weekly_details: weeklyDetails
      };
    }, `Error getting probation progress for sales ID ${salesId}`);
  },

  /**
   * Check all sales users and generate missing weeks
   * @returns Summary of operations performed
   */
  generateMissingWeeksForAllSales: async (): Promise<{ 
    totalUsers: number; 
    usersWithWeeks: number;
    usersWithoutWeeks: number;
    usersWithoutStartDate: number;
    weeksGenerated: number;
    errors: number;
  }> => {
    return tryCatchWrapper(async () => {
      console.log('[WeeklyDataService] Starting check for missing weeks across all sales users');
      
      // Create a delay function to avoid rate limits
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Initialize counters for summary
      const summary = {
        totalUsers: 0,
        usersWithWeeks: 0,
        usersWithoutWeeks: 0,
        usersWithoutStartDate: 0,
        weeksGenerated: 0,
        errors: 0
      };
      
      // Get all sales users using the existing salesService
      const salesResponse = await makeApiRequest('get', '/sales');
      
      if (!Array.isArray(salesResponse)) {
        throw new Error('Invalid response format for sales users');
      }
      
      const salesUsers = salesResponse;
      summary.totalUsers = salesUsers.length;
      console.log(`[WeeklyDataService] Found ${salesUsers.length} sales users`);
      
      // Process each sales user
      for (let i = 0; i < salesUsers.length; i++) {
        const salesUser = salesUsers[i];
        console.log(`[WeeklyDataService] Processing sales user ${i+1}/${salesUsers.length}: ID ${salesUser.id}`);
        
        try {
          // Check if this sales user has any weeks using existing function
          const weeks = await weeklyDataService.getWeeksBySalesIdRaw(salesUser.id, { forceRefresh: true });
          
          if (weeks.length === 0) {
            summary.usersWithoutWeeks++;
            
            // Validate starting date
            if (!salesUser.starting_date) {
              console.warn(`[WeeklyDataService] Sales ID ${salesUser.id} has no starting_date, skipping`);
              summary.usersWithoutStartDate++;
              continue;
            }
            
            console.log(`[WeeklyDataService] No weeks found for sales ID ${salesUser.id}, generating...`);
            
            // Use existing function to generate weeks
            await weeklyDataService.generateWeeksForSales(salesUser.id, salesUser.starting_date);
            summary.weeksGenerated += 12; // Standard 12 weeks
          } else {
            console.log(`[WeeklyDataService] Sales ID ${salesUser.id} already has ${weeks.length} weeks, skipping generation`);
            summary.usersWithWeeks++;
          }
        } catch (error: any) {
          console.error(`[WeeklyDataService] Error processing sales ID ${salesUser.id}:`, error.message);
          summary.errors++;
          
          // If error was in checking weeks, try to generate them anyway if we have a starting date
          if (salesUser.starting_date) {
            try {
              console.log(`[WeeklyDataService] Attempting to generate weeks despite error...`);
              await weeklyDataService.generateWeeksForSales(salesUser.id, salesUser.starting_date);
              summary.weeksGenerated += 12;
            } catch (genError: any) {
              console.error(`[WeeklyDataService] Failed to generate weeks:`, genError.message);
              // Already counted the error above
            }
          }
        }
        
        // Add a delay between users to avoid rate limits
        await delay(1000);
      }
      
      console.log(`[WeeklyDataService] Completed checking and generating missing weeks:`);
      console.log(`  Total sales users: ${summary.totalUsers}`);
      console.log(`  Users with existing weeks: ${summary.usersWithWeeks}`);
      console.log(`  Users without weeks (processed): ${summary.usersWithoutWeeks}`);
      console.log(`  Users without starting date (skipped): ${summary.usersWithoutStartDate}`);
      console.log(`  Total new weeks generated: ${summary.weeksGenerated}`);
      console.log(`  Errors encountered: ${summary.errors}`);
      
      return summary;
    }, 'Error checking and generating missing weeks for all sales users');
  }
}; 