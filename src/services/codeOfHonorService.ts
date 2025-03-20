import { makeApiRequest, tryCatchWrapper } from "./api/xanoClient";
import { BaseItem } from "../components/dashboard/tables/BaseTable";

export interface CodeOfHonor extends BaseItem {
  id: number;
  created_at: string;
  code_of_honor_name?: string;
  code_of_honor_text?: string;
  explanation?: string;
  name: string;
}

export interface CreateCodeOfHonorRequest {
  code_of_honor_name: string;
  explanation?: string;
}

export interface UpdateCodeOfHonorRequest {
  code_of_honor_name?: string;
  explanation?: string;
}

class CodeOfHonorService {
  /**
   * Get all Code of Honor records
   */
  async getAllCodeOfHonors(): Promise<CodeOfHonor[]> {
    return tryCatchWrapper(async () => {
      console.log('Fetching all Codes of Honor');
      
      const data = await makeApiRequest('get', '/code_of_honor');
      
      console.log('Codes of Honor fetched successfully:', data);
      // Map the response to include the name property required by BaseItem
      return data.map((codeOfHonor: any) => {
        // Use code_of_honor_name from the API response
        const text = codeOfHonor.code_of_honor_name || '';
        return {
          ...codeOfHonor,
          // Ensure code_of_honor_text exists for backward compatibility
          code_of_honor_text: text,
          // Use text for name property 
          name: text
        };
      });
    }, 'getAllCodeOfHonors');
  }

  /**
   * Get a Code of Honor by ID
   */
  async getCodeOfHonorById(codeOfHonorId: number): Promise<CodeOfHonor> {
    return tryCatchWrapper(async () => {
      console.log(`Fetching Code of Honor with ID ${codeOfHonorId}`);
      
      const data = await makeApiRequest('get', `/code_of_honor/${codeOfHonorId}`);
      
      console.log('Code of Honor fetched successfully:', data);
      // Use code_of_honor_name from the API response
      const text = data.code_of_honor_name || '';
      
      // Add the name property required by BaseItem
      return {
        ...data,
        code_of_honor_text: text, // For backward compatibility
        name: text
      };
    }, `getCodeOfHonorById(${codeOfHonorId})`);
  }

  /**
   * Create a new Code of Honor
   */
  async createCodeOfHonor(codeOfHonorData: CreateCodeOfHonorRequest): Promise<CodeOfHonor> {
    return tryCatchWrapper(async () => {
      console.log('Creating new Code of Honor with data:', codeOfHonorData);
      
      const data = await makeApiRequest('post', '/code_of_honor', codeOfHonorData);
      
      console.log('Code of Honor created successfully:', data);
      // Use code_of_honor_name from the API response
      const text = data.code_of_honor_name || '';
      
      // Add the name property required by BaseItem
      return {
        ...data,
        code_of_honor_text: text, // For backward compatibility
        name: text
      };
    }, 'createCodeOfHonor');
  }

  /**
   * Update an existing Code of Honor
   */
  async updateCodeOfHonor(codeOfHonorId: number, codeOfHonorData: UpdateCodeOfHonorRequest): Promise<CodeOfHonor> {
    return tryCatchWrapper(async () => {
      console.log(`Updating Code of Honor with ID ${codeOfHonorId} with data:`, codeOfHonorData);
      console.log(`API endpoint: /code_of_honor/${codeOfHonorId}`);
      
      const data = await makeApiRequest('patch', `/code_of_honor/${codeOfHonorId}`, codeOfHonorData);
      
      console.log('Update Code of Honor response:', data);
      
      // Use code_of_honor_name from the API response
      const text = data.code_of_honor_name || '';
      
      // Add the name property required by BaseItem
      return {
        ...data,
        code_of_honor_text: text, // For backward compatibility
        name: text
      };
    }, `updateCodeOfHonor(${codeOfHonorId})`);
  }

  /**
   * Delete a Code of Honor
   */
  async deleteCodeOfHonor(codeOfHonorId: number): Promise<void> {
    return tryCatchWrapper(async () => {
      await makeApiRequest('delete', `/code_of_honor/${codeOfHonorId}`);
    }, `deleteCodeOfHonor(${codeOfHonorId})`);
  }
}

export const codeOfHonorService = new CodeOfHonorService(); 