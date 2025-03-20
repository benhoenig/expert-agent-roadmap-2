import { makeApiRequest, tryCatchWrapper } from "./api/xanoClient";
import { BaseItem } from "../components/dashboard/tables/BaseTable";

export interface KPI extends BaseItem {
  id: number;
  created_at: string;
  kpi_name: string;
  kpi_type: 'Action' | 'Skillset';
}

export interface CreateKPIRequest {
  kpi_name: string;
  kpi_type: 'Action' | 'Skillset';
}

export interface UpdateKPIRequest {
  kpi_name?: string;
  kpi_type?: 'Action' | 'Skillset';
}

class KPIService {
  /**
   * Get all KPI records
   */
  async getAllKPIs(): Promise<KPI[]> {
    return tryCatchWrapper(async () => {
      console.log('Fetching all KPIs');
      
      const data = await makeApiRequest('get', '/kpi');
      
      console.log('KPIs fetched successfully:', data);
      // Map the response to include the name property required by BaseItem
      return data.map((kpi: any) => ({
        ...kpi,
        name: kpi.kpi_name // Map kpi_name to name for BaseItem compatibility
      }));
    }, 'getAllKPIs');
  }

  /**
   * Get a KPI by ID
   */
  async getKPIById(kpiId: number): Promise<KPI> {
    return tryCatchWrapper(async () => {
      console.log(`Fetching KPI with ID ${kpiId}`);
      
      const data = await makeApiRequest('get', `/kpi/${kpiId}`);
      
      console.log('KPI fetched successfully:', data);
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.kpi_name // Map kpi_name to name for BaseItem compatibility
      };
    }, `getKPIById(${kpiId})`);
  }

  /**
   * Create a new KPI
   */
  async createKPI(kpiData: CreateKPIRequest): Promise<KPI> {
    return tryCatchWrapper(async () => {
      console.log('Creating new KPI with data:', kpiData);
      
      const data = await makeApiRequest('post', '/kpi', kpiData);
      
      console.log('KPI created successfully:', data);
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.kpi_name // Map kpi_name to name for BaseItem compatibility
      };
    }, 'createKPI');
  }

  /**
   * Update an existing KPI
   */
  async updateKPI(kpiId: number, kpiData: UpdateKPIRequest): Promise<KPI> {
    return tryCatchWrapper(async () => {
      console.log(`Updating KPI with ID ${kpiId} with data:`, kpiData);
      console.log(`API endpoint: /kpi/${kpiId}`);
      
      const data = await makeApiRequest('patch', `/kpi/${kpiId}`, kpiData);
      
      console.log('Update KPI response:', data);
      
      // Add the name property required by BaseItem
      return {
        ...data,
        name: data.kpi_name // Map kpi_name to name for BaseItem compatibility
      };
    }, `updateKPI(${kpiId})`);
  }

  /**
   * Delete a KPI
   */
  async deleteKPI(kpiId: number): Promise<void> {
    return tryCatchWrapper(async () => {
      await makeApiRequest('delete', `/kpi/${kpiId}`);
    }, `deleteKPI(${kpiId})`);
  }
}

export const kpiService = new KPIService(); 