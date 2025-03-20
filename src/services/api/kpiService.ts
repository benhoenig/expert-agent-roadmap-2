import { tryCatchWrapper, makeApiRequest } from './xanoClient';
import { createCrudService } from './crudServiceFactory';
import { deduplicateRequest } from './makeApiRequest';

// KPI Types
export type KpiType = 'Action' | 'Skillset' | 'Other';

export interface Kpi {
  id: number;
  created_at: string;
  kpi_name: string;
  kpi_type: KpiType;
  kpi_description?: string;
  updated_at?: string;
}

export interface KpiActionProgress {
  id: number;
  date: string;
  kpi_id: number;
  kpi_name: string;
  kpi_type: string;
  action_count: number;
  remark?: string;
  sales_id: number;
  week_id: number;
  attachment_url?: string;
}

export interface KpiSkillsetProgress {
  id: number;
  date: string;
  kpi_id: number;
  kpi_name: string;
  kpi_type: string;
  wording_score?: number;
  tonality_score?: number;
  rapport_score?: number;
  average_score?: number;
  remark?: string;
  sales_id: number;
  week_id: number;
  attachment_url?: string;
}

// Create base CRUD operations for KPIs
const kpiCrud = createCrudService<Kpi>('/kpi', 'KPI');
const kpiActionProgressCrud = createCrudService<KpiActionProgress>('/kpi_action_progress', 'KpiActionProgress');
const kpiSkillsetProgressCrud = createCrudService<KpiSkillsetProgress>('/kpi_skillset_progress', 'KpiSkillsetProgress');

/**
 * Service for KPI-related API operations
 */
export const kpiService = {
  /**
   * Get all KPIs
   * @param options - Optional parameters for the request
   * @returns Array of KPIs
   */
  getAllKpis: async (options?: { forceRefresh?: boolean }): Promise<Kpi[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[KpiService] Fetching all kpis${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      return deduplicateRequest(
        'all_kpis',
        () => makeApiRequest('get', '/kpi', null, { 
          forceRefresh: options?.forceRefresh || false 
        }),
        { 
          forceRefresh: options?.forceRefresh || false,
          cacheTTL: 30 * 60 * 1000 // 30 minutes cache
        }
      );
    }, 'Error fetching kpis');
  },

  /**
   * Get a specific KPI by ID
   * @param kpiId - The ID of the KPI to retrieve
   * @param options - Optional parameters for the request
   * @returns KPI data
   */
  getKpiById: async (kpiId: number, options?: { forceRefresh?: boolean }): Promise<Kpi> => {
    return tryCatchWrapper(async () => {
      console.log(`[KpiService] Fetching KPI with ID ${kpiId}${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      return deduplicateRequest(
        `kpi_${kpiId}`,
        () => makeApiRequest('get', `/kpi/${kpiId}`, null, { 
          forceRefresh: options?.forceRefresh || false 
        }),
        { 
          forceRefresh: options?.forceRefresh || false,
          cacheTTL: 30 * 60 * 1000 // 30 minutes cache
        }
      );
    }, `Error fetching KPI with ID ${kpiId}`);
  },

  /**
   * Create a new KPI record
   * @param kpiData - The KPI data to create
   * @returns Created KPI data
   */
  createKpi: async (kpiData: Partial<Kpi>): Promise<Kpi> => kpiCrud.create(kpiData),

  /**
   * Update an existing KPI record
   * @param kpiId - The ID of the KPI to update
   * @param kpiData - The updated KPI data
   * @returns Updated KPI data
   */
  updateKpi: async (kpiId: number, kpiData: Partial<Kpi>): Promise<Kpi> => kpiCrud.update(kpiId, kpiData),

  /**
   * Delete a KPI record
   * @param kpiId - The ID of the KPI to delete
   * @returns Success status
   */
  deleteKpi: async (kpiId: number): Promise<void> => kpiCrud.delete(kpiId),

  /**
   * Get KPIs by type (filters the results after fetching all KPIs)
   * @param type - KPI type to filter by ('Action' or 'Skillset')
   * @param options - Optional parameters for the request
   * @returns Array of filtered KPI data
   */
  getKpisByType: async (type: KpiType, options?: { forceRefresh?: boolean }): Promise<Kpi[]> => {
    return tryCatchWrapper(async () => {
      console.log(`[KpiService] Fetching KPIs of type ${type}${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      return deduplicateRequest(
        `kpis_type_${type}`,
        async () => {
          const allKpis = await kpiService.getAllKpis(options);
          return allKpis.filter(kpi => kpi.kpi_type === type);
        },
        { 
          forceRefresh: options?.forceRefresh || false,
          cacheTTL: 30 * 60 * 1000 // 30 minutes cache
        }
      );
    }, `Error fetching KPIs of type ${type}`);
  },
  
  /**
   * Get current week
   * @returns Current week data
   */
  getCurrentWeek: async () => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', '/week/current');
      return data;
    }, "Error fetching current week");
  },
  
  /**
   * Get all KPI progress - can be action or skillset progress
   * @param type - The type of KPI progress to fetch
   * @param options - Optional parameters for the request
   * @returns Array of KPI progress records
   */
  getAllKPIProgress: async (type: KpiType = 'Skillset', options?: { forceRefresh?: boolean }) => {
    if (type === 'Action') {
      return kpiActionProgressCrud.getAll(options);
    } else {
      return kpiSkillsetProgressCrud.getAll(options);
    }
  },
  
  /**
   * Get KPI progress by ID
   * @param id - KPI progress ID
   * @param type - The type of KPI progress
   * @param options - Optional parameters for the request
   * @returns KPI progress data
   */
  getKPIProgressById: async (id: number, type: KpiType = 'Skillset', options?: { forceRefresh?: boolean }) => {
    if (type === 'Action') {
      return kpiActionProgressCrud.getById(id, options);
    } else {
      return kpiSkillsetProgressCrud.getById(id, options);
    }
  },
  
  /**
   * Add KPI progress
   * @param progressData - KPI progress data
   * @returns Created KPI progress data
   */
  addKPIProgress: async (progressData: {
    date: Date;
    kpi_type: string;
    kpi_name: string;
    kpi_id?: number;
    action_count?: number;
    wording_score?: number;
    tonality_score?: number;
    rapport_score?: number;
    average_score?: number;
    remark?: string;
    user_id?: number;
    week_id?: number;
    attachment?: File;
  }) => {
    return tryCatchWrapper(async () => {
      // Format the date as YYYY-MM-DD
      const formattedDate = progressData.date instanceof Date 
        ? progressData.date.toISOString().split('T')[0] 
        : progressData.date;

      // Determine the correct endpoint based on KPI type
      const isActionType = progressData.kpi_type === "Action" || progressData.kpi_type === "action";
      const endpoint = isActionType ? "/kpi_action_progress" : "/kpi_skillset_progress";
      
      console.log(`[KpiService] Using endpoint: ${endpoint} for KPI type: ${progressData.kpi_type}`);
      
      // Get the sales record for this user_id if necessary
      let salesId = null;
      if (progressData.user_id) {
        try {
          const salesData = await makeApiRequest('get', '/sales', { with: 'user' });
          const salesRecord = salesData.find(record => record.user_id === progressData.user_id);
          if (salesRecord) {
            salesId = salesRecord.id;
          }
        } catch (error) {
          console.error("[KpiService] Error fetching sales record:", error);
        }
      }
      
      // Clone the progressData to avoid modifying the original
      const payload: Record<string, any> = { 
        ...progressData,
        date: formattedDate
      };
      
      // Add sales_id if found
      if (salesId) {
        payload.sales_id = salesId;
      }
      
      console.log("[KpiService] Final KPI progress payload:", payload);
      
      // If there's an attachment, use FormData for the request
      if (progressData.attachment) {
        const formData = new FormData();
        
        // Add the file and path
        formData.append('attachment', progressData.attachment);
        const uploadPath = isActionType ? 'kpi_action_attachments/' : 'kpi_skillset_attachments/';
        formData.append('path', uploadPath + progressData.attachment.name);
        
        // Add all other fields to the form data
        Object.entries(payload).forEach(([key, value]) => {
          if (key !== 'attachment' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        // Make the request with the form data
        return await makeApiRequest('post', endpoint, formData, { useCache: false });
      } else {
        // No attachment, just send the JSON payload
        return await makeApiRequest('post', endpoint, payload, { useCache: false });
      }
    }, "Error adding KPI progress");
  },
  
  /**
   * Update KPI progress
   * @param id - KPI progress ID
   * @param progressData - Updated KPI progress data
   * @param type - The type of KPI progress
   * @returns Updated KPI progress data
   */
  updateKPIProgress: async (id: number, progressData: any, type: KpiType = 'Skillset') => {
    return tryCatchWrapper(async () => {
      console.log(`[KpiService] Updating KPI progress with ID ${id}:`, progressData);
      
      // The endpoint differs based on the KPI type
      const endpoint = type === 'Action' 
        ? `/kpi_action_progress/${id}` 
        : `/kpi_skillset_progress/${id}`;
      
      // If there's an attachment, use FormData
      if (progressData.attachment) {
        const formData = new FormData();
        
        // Add the attachment and path
        formData.append('attachment', progressData.attachment);
        const uploadPath = type === 'Action' 
          ? 'kpi_action_attachments/' 
          : 'kpi_skillset_attachments/';
        formData.append('path', uploadPath + progressData.attachment.name);
        
        // Add all other fields to the form data
        Object.entries(progressData).forEach(([key, value]) => {
          if (key !== 'attachment' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        return await makeApiRequest('patch', endpoint, formData, { useCache: false });
      } else {
        // If no attachment, send JSON directly
        return await makeApiRequest('patch', endpoint, progressData, { useCache: false });
      }
    }, `Error updating KPI progress with ID ${id}`);
  },
  
  /**
   * Delete KPI progress
   * @param id - KPI progress ID
   * @param type - The type of KPI progress
   * @returns Operation result
   */
  deleteKPIProgress: async (id: number, type: KpiType = 'Skillset') => {
    if (type === 'Action') {
      return kpiActionProgressCrud.delete(id);
    } else {
      return kpiSkillsetProgressCrud.delete(id);
    }
  }
}; 