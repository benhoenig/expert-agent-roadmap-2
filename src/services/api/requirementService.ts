import { tryCatchWrapper, makeApiRequest } from './xanoClient';
import { salesService } from './salesService';
import { createCrudService } from './crudServiceFactory';

// Define interfaces for strong typing
export interface Requirement {
  id: number;
  created_at: string;
  requirement_name: string;
}

export interface RequirementProgress {
  id: number;
  sales_id: number;
  week_id: number;
  requirement_id: number;
  date_added: string;
  count: number;
  training_name?: string;
  lesson_name?: string;
  senior_name?: string;
  case_type?: string;
  lesson_learned: string;
  remark?: string;
  updated_at: string;
  mentor_edited: number;
  attachment_url?: string;
}

// Create base CRUD operations for requirements
const requirementCrud = createCrudService<Requirement>('/requirement', 'Requirement');
const requirementProgressCrud = createCrudService<RequirementProgress>('/requirement_progress', 'RequirementProgress');

/**
 * Service for requirement and requirement progress operations
 */
export const requirementService = {
  // ========= Requirement Progress Methods =========
  
  /**
   * Add requirement progress
   * @param requirementData - Requirement progress data
   * @returns Created requirement progress data
   */
  addRequirementProgress: async (requirementData: {
    sales_id?: number;
    user_id?: number;
    week_id: number;
    requirement_id: number;
    date_added: string;
    count: number;
    training_name?: string;
    lesson_name?: string;
    senior_name?: string;
    case_type?: string;
    lesson_learned: string;
    remark?: string;
    updated_at: string;
    mentor_edited: number;
    attachment?: File;
  }) => {
    return tryCatchWrapper(async () => {
      console.log("[RequirementService] Adding requirement progress:", requirementData);
      
      // Get the sales record for this user_id if needed
      let salesId = null;
      
      // If sales_id is already provided, use it directly
      if (requirementData.sales_id) {
        salesId = requirementData.sales_id;
        console.log(`[RequirementService] Using provided sales_id: ${salesId}`);
      } else if (requirementData.user_id) {
        // Otherwise, we need to fetch it using user_id
        try {
          // Get all sales records, since getSalesUsers doesn't support filtering by user_id
          const salesRecords = await salesService.getSalesUsers({});
          const salesRecord = salesRecords.find(record => record.user_id === requirementData.user_id);
          
          if (salesRecord && salesRecord.id) {
            salesId = salesRecord.id;
            console.log(`[RequirementService] Found sales_id: ${salesId} for user_id: ${requirementData.user_id}`);
          } else {
            throw new Error(`No sales record found for user_id: ${requirementData.user_id}`);
          }
        } catch (error) {
          console.error("[RequirementService] Error fetching sales record:", error);
          throw new Error(`Failed to fetch sales record for user_id: ${requirementData.user_id}`);
        }
      } else {
        throw new Error("Either sales_id or user_id is required");
      }
      
      // Create a new payload with the correct sales_id
      const payload = {
        ...requirementData,
        sales_id: salesId
      };
      
      // Remove user_id from payload if it exists
      if ('user_id' in payload) {
        delete payload.user_id;
      }
      
      console.log("[RequirementService] Final requirement progress payload:", payload);
      
      // If there's an attachment, use FormData
      if (requirementData.attachment) {
        const formData = new FormData();
        
        // Add the attachment and path
        formData.append('attachment', requirementData.attachment);
        const uploadPath = 'requirement_attachments/' + requirementData.attachment.name;
        formData.append('path', uploadPath);
        
        // Add all other fields to the form data
        Object.entries(payload).forEach(([key, value]) => {
          if (key !== 'attachment' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        return await makeApiRequest('post', '/requirement_progress', formData, { useCache: false });
      } else {
        // If no attachment, send JSON directly
        return await makeApiRequest('post', '/requirement_progress', payload, { useCache: false });
      }
    }, "Error adding requirement progress");
  },
  
  /**
   * Get all requirement progress records
   * @param options - Optional parameters for the request
   * @returns Array of requirement progress records
   */
  getAllRequirementProgress: async (options?: { forceRefresh?: boolean }) => 
    requirementProgressCrud.getAll(options),
  
  /**
   * Get requirement progress by ID
   * @param id - Requirement progress ID
   * @param options - Optional parameters for the request
   * @returns Requirement progress data
   */
  getRequirementProgressById: async (id: number, options?: { forceRefresh?: boolean }) => 
    requirementProgressCrud.getById(id, options),
  
  /**
   * Update requirement progress
   * @param id - Requirement progress ID
   * @param progressData - Updated requirement progress data
   * @returns Updated requirement progress data
   */
  updateRequirementProgress: async (id: number, progressData: any) => {
    return tryCatchWrapper(async () => {
      console.log(`[RequirementService] Updating requirement progress with ID ${id}:`, progressData);
      
      // If there's an attachment, use FormData
      if (progressData.attachment) {
        const formData = new FormData();
        
        // Add the attachment and path
        formData.append('attachment', progressData.attachment);
        const uploadPath = 'requirement_attachments/' + progressData.attachment.name;
        formData.append('path', uploadPath);
        
        // Add all other fields to the form data
        Object.entries(progressData).forEach(([key, value]) => {
          if (key !== 'attachment' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        return await makeApiRequest('patch', `/requirement_progress/${id}`, formData, { useCache: false });
      } else {
        // If no attachment, send JSON directly
        return await makeApiRequest('patch', `/requirement_progress/${id}`, progressData, { useCache: false });
      }
    }, `Error updating requirement progress with ID ${id}`);
  },
  
  /**
   * Delete requirement progress
   * @param id - Requirement progress ID
   * @returns Operation result
   */
  deleteRequirementProgress: async (id: number) => requirementProgressCrud.delete(id),

  // ========= Requirements Methods =========
  
  /**
   * Get all requirements
   * @param options - Optional parameters for the request
   * @returns Array of requirements
   */
  getAllRequirements: async (options?: { forceRefresh?: boolean }): Promise<Requirement[]> => 
    requirementCrud.getAll(options),

  /**
   * Get a specific requirement by ID
   * @param requirementId - The ID of the requirement to retrieve
   * @param options - Optional parameters for the request
   * @returns Requirement data
   */
  getRequirementById: async (requirementId: number, options?: { forceRefresh?: boolean }): Promise<Requirement> => 
    requirementCrud.getById(requirementId, options),

  /**
   * Create a new requirement record
   * @param requirementData - The requirement data to create
   * @returns Created requirement data
   */
  createRequirement: async (requirementData: { requirement_name: string }): Promise<Requirement> => 
    requirementCrud.create(requirementData),

  /**
   * Update an existing requirement record
   * @param requirementId - The ID of the requirement to update
   * @param requirementData - The updated requirement data
   * @returns Updated requirement data
   */
  updateRequirement: async (requirementId: number, requirementData: { requirement_name?: string }): Promise<Requirement> => 
    requirementCrud.update(requirementId, requirementData),

  /**
   * Delete a requirement record
   * @param requirementId - The ID of the requirement to delete
   * @returns Success status
   */
  deleteRequirement: async (requirementId: number): Promise<void> => 
    requirementCrud.delete(requirementId)
}; 