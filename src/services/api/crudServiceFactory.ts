import { tryCatchWrapper, makeApiRequest } from './xanoClient';

/**
 * Factory function to create standardized CRUD operations for an entity
 * Creates consistent API methods with standardized error handling
 * 
 * @param basePath - API base path for the entity (e.g., '/kpi')
 * @param entityName - Human-readable entity name for error messages (e.g., 'KPI')
 * @returns Object with standard CRUD methods
 */
export const createCrudService = <T>(
  basePath: string,
  entityName: string
) => ({
  /**
   * Get all entities
   * @param options - Optional parameters for the request
   * @returns Array of entities
   */
  getAll: async (options?: { forceRefresh?: boolean; queryParams?: Record<string, any> }): Promise<T[]> => 
    tryCatchWrapper(async () => {
      console.log(`[${entityName}Service] Fetching all ${entityName.toLowerCase()}s${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      const data = await makeApiRequest('get', basePath, options?.queryParams || null, { 
        forceRefresh: options?.forceRefresh || false 
      });
      
      return data;
    }, `Error fetching ${entityName.toLowerCase()}s`),
      
  /**
   * Get a specific entity by ID
   * @param id - The ID of the entity to retrieve
   * @param options - Optional parameters for the request
   * @returns Entity data
   */
  getById: async (id: number, options?: { forceRefresh?: boolean }): Promise<T> =>
    tryCatchWrapper(async () => {
      console.log(`[${entityName}Service] Fetching ${entityName.toLowerCase()} with ID ${id}${options?.forceRefresh ? ' (forced refresh)' : ''}`);
      
      const data = await makeApiRequest('get', `${basePath}/${id}`, null, { 
        forceRefresh: options?.forceRefresh || false 
      });
      
      return data;
    }, `Error fetching ${entityName.toLowerCase()} with ID ${id}`),
      
  /**
   * Create a new entity
   * @param data - The entity data to create
   * @returns Created entity data
   */
  create: async (data: Partial<T>): Promise<T> =>
    tryCatchWrapper(async () => {
      console.log(`[${entityName}Service] Creating new ${entityName.toLowerCase()}`);
      
      const result = await makeApiRequest('post', basePath, data, { 
        useCache: false 
      });
      
      return result;
    }, `Error creating ${entityName.toLowerCase()}`),
      
  /**
   * Update an existing entity
   * @param id - The ID of the entity to update
   * @param data - The updated entity data
   * @returns Updated entity data
   */
  update: async (id: number, data: Partial<T>): Promise<T> =>
    tryCatchWrapper(async () => {
      console.log(`[${entityName}Service] Updating ${entityName.toLowerCase()} with ID ${id}`);
      
      const result = await makeApiRequest('patch', `${basePath}/${id}`, data, { 
        useCache: false 
      });
      
      return result;
    }, `Error updating ${entityName.toLowerCase()} with ID ${id}`),
      
  /**
   * Delete an entity
   * @param id - The ID of the entity to delete
   * @returns Success status
   */
  delete: async (id: number): Promise<void> =>
    tryCatchWrapper(async () => {
      console.log(`[${entityName}Service] Deleting ${entityName.toLowerCase()} with ID ${id}`);
      
      await makeApiRequest('delete', `${basePath}/${id}`, null, { 
        useCache: false 
      });
    }, `Error deleting ${entityName.toLowerCase()} with ID ${id}`),
}); 