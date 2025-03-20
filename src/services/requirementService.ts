import { makeApiRequest, tryCatchWrapper } from "./api/xanoClient";
import { BaseItem } from "../components/dashboard/tables/BaseTable";

export interface Requirement extends BaseItem {
  id: number;
  created_at: string;
  requirement_name: string;
}

export interface CreateRequirementRequest {
  requirement_name: string;
}

export interface UpdateRequirementRequest {
  requirement_name?: string;
}

class RequirementService {
  /**
   * Get all Requirement records
   */
  async getAllRequirements(): Promise<Requirement[]> {
    return tryCatchWrapper(async () => {
      console.log('Fetching all Requirements');
      
      const data = await makeApiRequest('get', '/requirement');
      
      console.log('Requirements fetched successfully:', data);
      // Map the response to include the name property required by BaseItem
      return data.map((requirement: any) => ({
        ...requirement,
        name: requirement.requirement_name // Map requirement_name to name for BaseItem compatibility
      }));
    }, 'getAllRequirements');
  }

  /**
   * Get a Requirement by ID
   */
  async getRequirementById(requirementId: number): Promise<Requirement> {
    return tryCatchWrapper(async () => {
      console.log(`Fetching Requirement with ID ${requirementId}`);
      
      const data = await makeApiRequest('get', `/requirement/${requirementId}`);
      
      console.log('Requirement fetched successfully:', data);
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.requirement_name // Map requirement_name to name for BaseItem compatibility
      };
    }, `getRequirementById(${requirementId})`);
  }

  /**
   * Create a new Requirement
   */
  async createRequirement(requirementData: CreateRequirementRequest): Promise<Requirement> {
    return tryCatchWrapper(async () => {
      console.log('Creating new Requirement with data:', requirementData);
      
      const data = await makeApiRequest('post', '/requirement', requirementData);
      
      console.log('Requirement created successfully:', data);
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.requirement_name // Map requirement_name to name for BaseItem compatibility
      };
    }, 'createRequirement');
  }

  /**
   * Update an existing Requirement
   */
  async updateRequirement(requirementId: number, requirementData: UpdateRequirementRequest): Promise<Requirement> {
    return tryCatchWrapper(async () => {
      console.log(`Updating Requirement with ID ${requirementId} with data:`, requirementData);
      console.log(`API endpoint: /requirement/${requirementId}`);
      
      const data = await makeApiRequest('patch', `/requirement/${requirementId}`, requirementData);
      
      console.log('Update Requirement response:', data);
      
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.requirement_name // Map requirement_name to name for BaseItem compatibility
      };
    }, `updateRequirement(${requirementId})`);
  }

  /**
   * Delete a Requirement
   */
  async deleteRequirement(requirementId: number): Promise<void> {
    return tryCatchWrapper(async () => {
      await makeApiRequest('delete', `/requirement/${requirementId}`);
    }, `deleteRequirement(${requirementId})`);
  }
}

export const requirementService = new RequirementService(); 